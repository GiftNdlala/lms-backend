from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import EWallet, Transaction
import logging
from django.contrib.auth import get_user_model
from rest_framework import status

logger = logging.getLogger(__name__)
User = get_user_model()

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ewallet_detail(request):
    logger.debug(f"E-wallet detail request received from user: {request.user}")
    try:
        ewallet = EWallet.objects.get(student=request.user)
        logger.debug(f"Found e-wallet with balance: {ewallet.balance}")
        return Response({
            'balance': str(ewallet.balance),
            'last_updated': ewallet.last_updated
        })
    except EWallet.DoesNotExist:
        logger.debug(f"No e-wallet found for user: {request.user}")
        return Response({'balance': '0.00', 'last_updated': None})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ewallet_transactions(request):
    logger.debug(f"E-wallet transactions request received from user: {request.user}")
    try:
        ewallet = EWallet.objects.get(student=request.user)
        transactions = Transaction.objects.filter(ewallet=ewallet).order_by('-created_at')[:20]
        logger.debug(f"Found {transactions.count()} transactions for user: {request.user}")
        return Response([
            {
                'date': t.created_at,
                'type': t.transaction_type,
                'amount': str(t.amount),
                'description': t.description,
                'status': t.status,
                'reference_number': t.reference_number
            } for t in transactions
        ])
    except EWallet.DoesNotExist:
        logger.debug(f"No e-wallet found for user: {request.user}")
        return Response([])

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Optionally add IsAdminUser or custom permission for instructors
def update_student_ewallet_balance(request, student_id):
    """
    Update a student's e-wallet balance and create a transaction record.
    Expects: {
        "new_balance": <float>,
        "reference": <str>,
        "instructor_name": <str>,
        "instructor_surname": <str>
    }
    """
    try:
        student = User.objects.get(id=student_id)
        ewallet, created = EWallet.objects.get_or_create(student=student)
        old_balance = ewallet.balance
        new_balance = request.data.get('new_balance')
        reference = request.data.get('reference', 'Instructor adjustment')
        instructor_name = request.data.get('instructor_name', '')
        instructor_surname = request.data.get('instructor_surname', '')
        
        if new_balance is None:
            return Response({'error': 'new_balance is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not instructor_name or not instructor_surname:
            return Response({'error': 'instructor_name and instructor_surname are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            new_balance = float(new_balance)
        except ValueError:
            return Response({'error': 'new_balance must be a number'}, status=status.HTTP_400_BAD_REQUEST)
            
        transaction_amount = new_balance - float(old_balance)
        instructor_info = f"Updated by {instructor_name} {instructor_surname}"
        full_reference = f"{reference} - {instructor_info}"
        
        # Update balance
        ewallet.balance = new_balance
        ewallet.save()
        
        # Create transaction
        Transaction.objects.create(
            ewallet=ewallet,
            amount=abs(transaction_amount),
            transaction_type='credit' if transaction_amount > 0 else 'debit',
            status='completed',
            description=full_reference,
            reference_number=f'INSTR-{ewallet.id}-{Transaction.objects.count()+1}'
        )
        
        logger.debug(f"Instructor {instructor_name} {instructor_surname} updated e-wallet for student {student.username}: {old_balance} -> {new_balance}")
        return Response({
            'old_balance': str(old_balance),
            'new_balance': str(new_balance),
            'transaction_amount': str(transaction_amount),
            'reference': full_reference
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error updating e-wallet: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
