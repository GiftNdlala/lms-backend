#!/usr/bin/env python3
"""
Debug CORS settings
"""
import os
import sys
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
sys.path.append('/workspace')

# Configure for production to match Render
os.environ['DEBUG'] = 'False'

try:
    django.setup()
    
    print("🔍 CORS Configuration Debug")
    print("=" * 50)
    
    # Check if corsheaders is installed
    print(f"✅ corsheaders in INSTALLED_APPS: {'corsheaders' in settings.INSTALLED_APPS}")
    
    # Check middleware
    cors_middleware = 'corsheaders.middleware.CorsMiddleware'
    middleware_list = settings.MIDDLEWARE
    print(f"✅ CORS Middleware present: {cors_middleware in middleware_list}")
    if cors_middleware in middleware_list:
        print(f"   Position: {middleware_list.index(cors_middleware)} (should be 0 or 1)")
    
    # Check CORS settings
    print(f"✅ CORS_ALLOW_ALL_ORIGINS: {getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', 'Not set')}")
    print(f"✅ CORS_ALLOWED_ORIGINS: {getattr(settings, 'CORS_ALLOWED_ORIGINS', 'Not set')}")
    print(f"✅ CORS_ALLOW_CREDENTIALS: {getattr(settings, 'CORS_ALLOW_CREDENTIALS', 'Not set')}")
    
    # Check if DEBUG affects CORS
    print(f"✅ DEBUG setting: {settings.DEBUG}")
    
    # Test the middleware manually
    from corsheaders.middleware import CorsMiddleware
    from django.http import HttpRequest, HttpResponse
    
    # Create a test request
    request = HttpRequest()
    request.method = 'OPTIONS'
    request.META['HTTP_ORIGIN'] = 'https://learning-management-system-1-6lka.onrender.com'
    request.META['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] = 'POST'
    request.META['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] = 'content-type'
    
    # Test CORS middleware
    cors_mw = CorsMiddleware(lambda req: HttpResponse())
    response = cors_mw(request)
    
    print("\n🧪 CORS Middleware Test:")
    print(f"   Response status: {response.status_code}")
    
    # Check response headers
    cors_headers = {k: v for k, v in response.items() if 'access-control' in k.lower()}
    if cors_headers:
        print("   CORS Headers found:")
        for header, value in cors_headers.items():
            print(f"     {header}: {value}")
    else:
        print("   ❌ No CORS headers found!")
    
    print("\n✅ Debug completed!")

except Exception as e:
    print(f"🔴 Error: {e}")
    import traceback
    traceback.print_exc()