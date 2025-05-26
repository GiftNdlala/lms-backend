import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import './StudentRewards.css';

const StudentRewards = ({ moduleId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rewardAmount, setRewardAmount] = useState('');
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/instructor/modules/${moduleId}/students/`);
      setStudents(response.data);
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleRewardClick = (student) => {
    setSelectedStudent(student);
    setShowRewardDialog(true);
  };

  const handleRewardSubmit = async () => {
    try {
      await axios.post('/api/transactions/', {
        ewallet: selectedStudent.ewallet.id,
        amount: parseFloat(rewardAmount),
        transaction_type: 'assessment_reward',
        description: `Reward for module ${moduleId}`,
        status: 'completed'
      });

      setSuccessMessage(`Successfully rewarded ${selectedStudent.user.first_name} ${selectedStudent.user.last_name}`);
      setShowRewardDialog(false);
      setRewardAmount('');
      setSelectedStudent(null);
      
      // Refresh student data to show updated balances
      fetchStudents();
    } catch (error) {
      console.error('Failed to process reward:', error);
      setError('Failed to process reward. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Student Rewards
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Student Rewards
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Current Balance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  {student.user.first_name} {student.user.last_name}
                </TableCell>
                <TableCell>₹{student.ewallet.balance.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRewardClick(student)}
                  >
                    Reward
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showRewardDialog} onClose={() => setShowRewardDialog(false)}>
        <DialogTitle>Reward Student</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reward Amount"
            type="number"
            fullWidth
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRewardDialog(false)}>Cancel</Button>
          <Button onClick={handleRewardSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentRewards; 