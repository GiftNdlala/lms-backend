from django.urls import path
from . import views

urlpatterns = [
    path('ewallets/', views.ewallet_detail, name='ewallet_detail'),
    path('transactions/', views.ewallet_transactions, name='ewallet_transactions'),
    path('ewallets/<int:student_id>/update_balance/', views.update_student_ewallet_balance, name='update_student_ewallet_balance'),
] 