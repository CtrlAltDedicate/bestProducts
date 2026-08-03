import logging
import requests
from django.contrib.auth.models import User
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Product
from .serializers import (
    ProductSerializer,
    ProductCreateSerializer,
    RegisterSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)

FAKESTORE_API_URL = 'https://fakestoreapi.com/products'


# ──────────────────────────────────────────────
# Auth Views
# ──────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """Register a new user and return JWT tokens immediately."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'data': {
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'message': 'Registration successful.',
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Authenticate with username + password, return JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = User.objects.filter(username=username).first()
        if user is None or not user.check_password(password):
            # Log failed attempt without leaking which field was wrong (OWASP A07)
            logger.warning('Failed login attempt for username: %s', username)
            return Response(
                {'data': None, 'message': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'data': {
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'message': 'Login successful.',
        })


class MeView(APIView):
    """Return the currently authenticated user's info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'data': UserSerializer(request.user).data,
            'message': 'Current user retrieved.',
        })


# ──────────────────────────────────────────────
# Product ViewSet
# ──────────────────────────────────────────────

class ProductViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for products.
    - List/Retrieve: any authenticated user.
    - Create: any authenticated user.
    - Update/Delete: owner or admin only (OWASP A01).
    """
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductSerializer

    def _is_owner_or_admin(self, product):
        user = self.request.user
        return user == product.created_by or user.is_staff

    def update(self, request, *args, **kwargs):
        product = self.get_object()
        if not self._is_owner_or_admin(product):
            return Response(
                {'data': None, 'message': 'You do not have permission to edit this product.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        if not self._is_owner_or_admin(product):
            return Response(
                {'data': None, 'message': 'You do not have permission to delete this product.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = ProductSerializer(queryset, many=True)
        return Response({'data': serializer.data, 'message': 'Products retrieved.'})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ProductSerializer(instance)
        return Response({'data': serializer.data, 'message': 'Product retrieved.'})

    def create(self, request, *args, **kwargs):
        serializer = ProductCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(
            {'data': ProductSerializer(product).data, 'message': 'Product created.'},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['post'], url_path='import_from_fakestore')
    def import_from_fakestore(self, request):
        """
        Fetch all products from Fakestore API and save them locally.
        Skips any product whose fakestore_id already exists to prevent duplicates.
        """
        try:
            response = requests.get(
                FAKESTORE_API_URL,
                timeout=10,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            response.raise_for_status()
            fakestore_products = response.json()
        except requests.RequestException as e:
            logger.error('Fakestore API request failed: %s', str(e))
            return Response(
                {'data': None, 'message': 'Failed to reach Fakestore API.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        imported = 0
        skipped = 0
        existing_ids = set(
            Product.objects.filter(fakestore_id__isnull=False)
            .values_list('fakestore_id', flat=True)
        )

        for item in fakestore_products:
            fid = item.get('id')
            if fid in existing_ids:
                skipped += 1
                continue

            Product.objects.create(
                title=item.get('title', ''),
                description=item.get('description', ''),
                price=item.get('price', 0),
                category=item.get('category', ''),
                image_url=item.get('image', ''),
                stock=10,  # default stock for imported products
                fakestore_id=fid,
                created_by=request.user,
            )
            imported += 1

        return Response({
            'data': {'imported': imported, 'skipped': skipped},
            'message': f'{imported} product(s) imported, {skipped} already existed.',
        })
