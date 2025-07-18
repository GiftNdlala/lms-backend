from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import json
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .views import login  # Import the original login function

class CorsLoginView(View):
    """
    Custom login view with explicit CORS handling
    """
    
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        
        # Add CORS headers to every response
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Max-Age"] = "3600"
        
        return response
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS request"""
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Max-Age"] = "3600"
        return response
    
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        """Handle POST login request"""
        try:
            # Parse JSON data
            data = json.loads(request.body.decode('utf-8'))
            
            # Create a mock request object for the original login function
            request.data = data
            request.content_type = 'application/json'
            
            # Call the original login function
            response = login(request)
            
            # Convert DRF Response to Django JsonResponse with CORS headers
            json_response = JsonResponse(response.data, status=response.status_code)
            json_response["Access-Control-Allow-Origin"] = "*"
            json_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            json_response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            
            return json_response
            
        except json.JSONDecodeError:
            response = JsonResponse(
                {'detail': 'Invalid JSON data'}, 
                status=400
            )
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as e:
            response = JsonResponse(
                {'detail': f'Server error: {str(e)}'}, 
                status=500
            )
            response["Access-Control-Allow-Origin"] = "*"
            return response

# Function-based view wrapper for URL routing
@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def cors_login_view(request):
    """Function-based wrapper for the CORS login view"""
    view = CorsLoginView()
    return view.dispatch(request)