from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
from products.views import RegisterView, LoginView, MeView

def cors_debug(request):
    return JsonResponse({
        'CORS_ALLOWED_ORIGINS': settings.CORS_ALLOWED_ORIGINS,
        'CORS_ALLOW_ALL_ORIGINS': getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False),
        'origin_header': request.headers.get('Origin', 'none'),
    })

urlpatterns = [
    path('debug/cors/', cors_debug, name='cors_debug'),
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='me'),
    path('api/', include('products.urls')),
]