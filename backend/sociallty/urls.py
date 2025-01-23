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
from django.conf.urls.static import static
from debug_toolbar.toolbar import debug_toolbar_urls
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("users/", include("users.urls")),
    path("api/", include("APIs.urls"), name="api"),
    path("", include("main_page.urls"), name="home"),
    path("user/token/", TokenObtainPairView.as_view()),
    path("user/refresh/", TokenRefreshView.as_view()),
    
    #! remove in production
] + debug_toolbar_urls()

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
