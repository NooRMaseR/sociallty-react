"""
URL configuration for sociallty project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("main_page.urls"), name="home"),
    path("api/", include("APIs.urls"), name="api"),
    path("user/", include("users.urls")),
    path("chat/", include("chat.urls")),
    path("chat/", include("chat.urls")),
    path("user/token/", TokenObtainPairView.as_view()),
    path("user/refresh/", TokenRefreshView.as_view()),
]


if settings.DEBUG:
    from debug_toolbar.toolbar import debug_toolbar_urls
    from drf_yasg.views import get_schema_view
    from debug_toolbar.toolbar import debug_toolbar_urls
    from drf_yasg.views import get_schema_view
    from django.conf.urls.static import static
    from rest_framework import permissions
    from drf_yasg import openapi
    
    schema_view = get_schema_view(
        openapi.Info(
            title="Sociallty APIs",
            default_version='v1',
            description="Sociallty APIs Documentation",
            terms_of_service="https://www.google.com/policies/terms/",
            contact=openapi.Contact(email="noorwne6@gmail.com"),
            license=openapi.License(name="MIT License"),
        ),
        public=False,
        permission_classes=(permissions.IsAuthenticated,)
    )
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += (
        path('swagger.<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
        path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
        path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    )
    urlpatterns += debug_toolbar_urls()
    urlpatterns += (
        path('swagger.<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
        path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
        path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    )
    urlpatterns += debug_toolbar_urls()
