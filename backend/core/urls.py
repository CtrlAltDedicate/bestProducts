from django.http import JsonResponse
from django.conf import settings

def cors_debug(request):
    return JsonResponse({
        'CORS_ALLOWED_ORIGINS': settings.CORS_ALLOWED_ORIGINS,
        'CORS_ALLOW_ALL_ORIGINS': getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False),
        'origin_header': request.headers.get('Origin', 'none'),
    })
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from products.views import RegisterView, LoginView, MeView

urlpatterns = [
    path('debug/cors/', cors_debug, name='cors_debug'),git add backend/core/urls.py
    path('admin/', admin.site.urls),

    # Auth endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='me'),

    # Product endpoints (router handles /api/products/ and /api/products/{id}/)
    path('api/', include('products.urls')),
]
