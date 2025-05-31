import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../services/api';

const Ewallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if wallet info is in localStorage (from quiz submission)
    const cachedBalance = localStorage.getItem('ewallet_balance');
    const cachedTransactions = localStorage.getItem('ewallet_transactions');
    if (cachedBalance && cachedTransactions) {
      setBalance(Number(cachedBalance));
      setTransactions(JSON.parse(cachedTransactions));
      // Clear cache after using
      localStorage.removeItem('ewallet_balance');
      localStorage.removeItem('ewallet_transactions');
    } else {
      fetchEWalletData();
    }
  }, []);

  const fetchEWalletData = async () => {
    try {
      setLoading(true);
      // Try to get the student's ewallet_balance from the students API
      const studentProfileRes = await api.get('/api/accounts/student/profile/');
      let balanceValue = 0;
      if (studentProfileRes.data && typeof studentProfileRes.data.ewallet_balance !== 'undefined') {
        balanceValue = Number(studentProfileRes.data.ewallet_balance);
      } else {
        // Fallback to the old logic if ewallet_balance is not present
        const ewalletResponse = await api.get('/api/assessments/ewallets/');
      if (ewalletResponse.data && ewalletResponse.data.length > 0) {
          balanceValue = Number(ewalletResponse.data[0].balance);
        }
      }
      setBalance(balanceValue);
      // Always fetch transactions as before
      const transactionsResponse = await api.get('/api/assessments/transactions/');
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Failed to fetch e-wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'assessment_reward':
        return <StarIcon sx={{ color: '#FFD700' }} />;
      case 'withdrawal_approved':
        return <AccountBalanceWalletIcon sx={{ color: '#4CAF50' }} />;
      default:
        return <TrendingUpIcon sx={{ color: '#8231D2' }} />;
    }
  };

  const getTransactionType = (type) => {
    const types = {
      'assessment_reward': 'Assessment Reward',
      'withdrawal_approved': 'Withdrawal',
      'credit': 'Credit',
      'debit': 'Debit'
    };
    return types[type] || type;
  };

  const formatDescription = (description) => {
    // Split the description into reference and instructor info
    const parts = description.split(' - ');
    if (parts.length === 2) {
      return (
        <Box>
          <Typography variant="body2">{parts[0]}</Typography>
          <Typography variant="caption" color="text.secondary">
            {parts[1]}
          </Typography>
        </Box>
      );
    }
    return description;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#8231D2', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  E-Wallet Balance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#8231D2' }}>
                ₹{balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Transaction History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Reference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction.reference_number}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(130, 49, 210, 0.05)'
                        }
                      }}
                    >
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getTransactionIcon(transaction.type)}
                          <Typography sx={{ ml: 1 }}>
                            {getTransactionType(transaction.type)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${Number(transaction.amount) > 0 ? '+' : ''}₹${Number(transaction.amount).toFixed(2)}`}
                          sx={{
                            backgroundColor: Number(transaction.amount) > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            color: Number(transaction.amount) > 0 ? '#4CAF50' : '#F44336'
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDescription(transaction.description)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.reference_number}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Ewallet;
