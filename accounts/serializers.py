from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.exceptions import ValidationError
from .models import User, Student, Instructor
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD  # Use email for authentication

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        self.fields.pop('username', None)

    def validate(self, attrs):
        # Use email and password for authentication
        email = attrs.get('email')
        password = attrs.get('password')
        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise ValidationError({'detail': 'Invalid credentials.'})
            self.user = user
        else:
            raise ValidationError({'detail': 'Must include "email" and "password".'})

        # Check if user is an instructor when logging into instructor portal
        if not hasattr(self.user, 'instructor'):
            raise ValidationError({'detail': 'This account does not have instructor privileges.'})

        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = UserSerializer(self.user).data
        data['must_change_password'] = self.user.must_change_password
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')
        read_only_fields = ('id', 'role')

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Student
        fields = '__all__'

class InstructorSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Instructor
        fields = '__all__'

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    role = serializers.ChoiceField(choices=['student', 'instructor', 'funder'], required=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not email or not password:
            raise serializers.ValidationError({
                'detail': 'Both email and password are required.'
            })

        try:
            user = User.objects.get(email=email, role=role)
            if not user.check_password(password):
                raise serializers.ValidationError({
                    'detail': 'Invalid credentials.'
                })
            if not user.is_active:
                raise serializers.ValidationError({
                    'detail': 'This account is inactive.'
                })
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'detail': f'No {role} account found with this email.'
            })

        data['user'] = user
        return data

class TokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
    role_data = serializers.SerializerMethodField()

    def get_role_data(self, obj):
        user = obj['user']
        if user.role == 'student':
            return StudentSerializer(Student.objects.get(user=user)).data
        elif user.role == 'instructor':
            return InstructorSerializer(Instructor.objects.get(user=user)).data
        return None 