from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, email=None, password=None, role=None, **kwargs):
        try:
            print(f"EmailBackend authenticate - Username: {username}, Email: {email}, Role: {role}")  # Debug print
            
            # Try to get user by username first (for admin login)
            if username:
                user = User.objects.get(username=username, is_active=True)
                if user.check_password(password):
                    return user
                return None
            
            # If no username, try email authentication
            if email:
                query = Q(email__iexact=email) & Q(is_active=True)
                if role:
                    query &= Q(role=role)
                
                user = User.objects.get(query)
                print(f"Found user: {user.username}, Role: {user.role}")  # Debug print
                
                if user.check_password(password):
                    # For instructors, verify they have an instructor profile
                    if role == 'instructor' and not hasattr(user, 'instructor'):
                        print("User found but no instructor profile")  # Debug print
                        return None
                        
                    print("Authentication successful")  # Debug print
                    return user
                else:
                    print("Invalid password")  # Debug print
                    return None
                    
        except User.DoesNotExist:
            print(f"No user found with username/email: {username or email}")  # Debug print
            return None
        except User.MultipleObjectsReturned:
            print(f"Multiple users found with email: {email}")  # Debug print
            # If multiple users found, get the most recently created one
            user = User.objects.filter(query).order_by('-date_joined').first()
            if user and user.check_password(password):
                return user
            return None
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id, is_active=True)
        except User.DoesNotExist:
            return None 