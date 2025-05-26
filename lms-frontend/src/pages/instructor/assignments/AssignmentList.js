import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import instructorApi from '../../../services/instructorApi';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/assignments/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setError('Failed to load assignments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    navigate('/dashboard/instructor/assignments/create');
  };

  const handleEditAssignment = (id) => {
    navigate(`/dashboard/instructor/assignments/${id}/edit`);
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await instructorApi.deleteAssignment(id);
        fetchAssignments();
      } catch (error) {
        alert('Failed to delete assignment.');
      }
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Assignments</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateAssignment}
        >
          Create Assignment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.module?.title}</TableCell>
                <TableCell>{new Date(assignment.due_date).toLocaleDateString()}</TableCell>
                <TableCell>{assignment.status || 'Active'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditAssignment(assignment.id)}
                    sx={{ mr: 1 }}
                  >
                    <span role="img" aria-label="edit">✏️</span>
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                  >
                    <span role="img" aria-label="delete">🗑️</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AssignmentList; 