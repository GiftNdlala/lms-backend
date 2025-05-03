from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.renderers import JSONRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .renderers import CustomBrowsableAPIRenderer
from .models import User, Student, Instructor
from .serializers import (
    UserSerializer, StudentSerializer, InstructorSerializer,
    LoginSerializer, TokenSerializer
)
from .services import change_student_password
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'detail': 'Both old and new passwords are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {'detail': 'Old password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password changed successfully.'})

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Student.objects.filter(is_active=True)
        elif user.role == 'student':
            return Student.objects.filter(user=user)
        return Student.objects.none()

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        """Get all active students with their names for the select dropdown"""
        students = self.get_queryset()
        data = [{
            'id': student.id,
            'student_id': student.student_id,
            'first_name': student.user.first_name,
            'last_name': student.user.last_name,
            'program': student.program,
            'batch': student.batch
        } for student in students]
        return Response(data)

    @action(detail=False, methods=['get'])
    def available_courses(self, request):
        student = request.user.student
        courses = student.get_available_courses()
        from courses.serializers import CourseSerializer
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_enrollments(self, request):
        student = request.user.student
        enrollments = student.enrollments.all()
        from courses.serializers import EnrollmentSerializer
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def enroll(self, request):
        student = request.user.student
        course_id = request.data.get('course_id')
        
        if not course_id:
            return Response(
                {"detail": "Course ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        from courses.models import Course
        try:
            course = Course.objects.get(id=course_id, is_active=True)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        enrollment = student.enroll_in_course(course)
        from courses.serializers import EnrollmentSerializer
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data)

class InstructorViewSet(viewsets.ModelViewSet):
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Instructor.objects.filter(user=user)
        elif user.is_staff:
            return Instructor.objects.all()
        return Instructor.objects.none()

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get the current instructor's profile"""
        if not hasattr(request.user, 'instructor'):
            return Response(
                {"detail": "User is not an instructor"},
                status=status.HTTP_403_FORBIDDEN
            )
        instructor = request.user.instructor
        serializer = self.get_serializer(instructor)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def assigned_modules(self, request):
        """Get all modules assigned to the current instructor"""
        if not hasattr(request.user, 'instructor'):
            return Response(
                {"detail": "User is not an instructor"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from modules.models import Module
        modules = Module.objects.filter(instructor=request.user.instructor)
        from modules.serializers import ModuleSerializer
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def students(self, request):
        """Get all students for the current instructor"""
        if not hasattr(request.user, 'instructor'):
            return Response(
                {"detail": "User is not an instructor"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        students = Student.objects.filter(is_active=True)
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        instructor = request.user.instructor
        courses = instructor.get_active_courses()
        from courses.serializers import CourseDetailSerializer
        serializer = CourseDetailSerializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_students(self, request):
        instructor = request.user.instructor
        from courses.models import CourseEnrollment
        enrollments = CourseEnrollment.objects.filter(
            course__instructor=request.user,
            status='enrolled'
        ).select_related('student')
        students = [enrollment.student for enrollment in enrollments]
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_student(self, request):
        # Remove the strict instructor check, just ensure user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        from .services import register_student
        try:
            student = register_student(request.data)
            serializer = StudentSerializer(student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'login'

    def validate(self, attrs):
        login = attrs.get('login')
        password = attrs.get('password')
        
        print(f"Attempting login with: {login}")  # Debug print
        
        if not login or not password:
            raise serializers.ValidationError({
                'detail': 'Both login and password are required.'
            })

        # Try to fetch user by email first, then username
        User = get_user_model()
        try:
            user = User.objects.get(email=login)
            print(f"Found user by email: {user.username}")  # Debug print
        except User.DoesNotExist:
            try:
                user = User.objects.get(username=login)
                print(f"Found user by username: {user.username}")  # Debug print
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'detail': 'No active account found with the given credentials'
                })

        if not user.check_password(password):
            raise serializers.ValidationError({
                'detail': 'Invalid password'
            })

        attrs['username'] = user.username
        return super().validate(attrs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = []  # Allow unauthenticated access

    def post(self, request, *args, **kwargs):
        print(f"Received login request with data: {request.data}")  # Debug print
        response = super().post(request, *args, **kwargs)
        print(f"Login response: {response.data}")  # Debug print
        return response

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Update last login time
        if hasattr(user, 'student'):
            user.student.last_login_at = timezone.now()
            user.student.save()
        elif hasattr(user, 'instructor'):
            user.instructor.last_login_at = timezone.now()
            user.instructor.save()

        # Prepare response data
        token_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }
        
        return Response(token_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
