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
import axios from 'axios';

const Ewallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEWalletData();
  }, []);

  const fetchEWalletData = async () => {
    try {
      setLoading(true);
      const [ewalletResponse, transactionsResponse] = await Promise.all([
        axios.get('/api/ewallets/'),
        axios.get('/api/transactions/')
      ]);
      
      if (ewalletResponse.data && ewalletResponse.data.length > 0) {
        setBalance(ewalletResponse.data[0].balance);
      }
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
    };
    return types[type] || type;
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #8231D2, #4CAF50)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Achievement Wallet
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#8231D2' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #8231D2 0%, #4CAF50 100%)',
                color: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(130, 49, 210, 0.2)'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Current Balance</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  ₹{balance.toFixed(2)}
                </Typography>
                {balance >= 500 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                    <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 600 }}>
                      You are eligible for withdrawal!
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                      Please show this balance to your instructor for processing.
                    </Typography>
                  </Box>
                )}
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(130, 49, 210, 0.05)'
                          }
                        }}
                      >
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getTransactionIcon(transaction.transaction_type)}
                            <Typography sx={{ ml: 1 }}>
                              {getTransactionType(transaction.transaction_type)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${transaction.amount > 0 ? '+' : ''}₹${transaction.amount.toFixed(2)}`}
                            sx={{
                              backgroundColor: transaction.amount > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                              color: transaction.amount > 0 ? '#4CAF50' : '#F44336'
                            }}
                          />
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Ewallet;
