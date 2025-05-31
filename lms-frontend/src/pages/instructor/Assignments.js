import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [modules, setModules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchModules = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/modules/instructor/modules/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to load modules. Please try again later.');
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First get all modules
      const modulesResponse = await axios.get(`${API_BASE_URL}/api/modules/instructor/modules/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Then get assignments for each module
      const allAssignments = [];
      for (const module of modulesResponse.data) {
        try {
          const assignmentsResponse = await axios.get(
            `${API_BASE_URL}/api/modules/instructor/modules/${module.id}/assignments/`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (Array.isArray(assignmentsResponse.data)) {
            // Add module info to each assignment
            const moduleAssignments = assignmentsResponse.data.map(assignment => ({
              ...assignment,
              module_title: module.title
            }));
            allAssignments.push(...moduleAssignments);
          }
        } catch (error) {
          console.error(`Error fetching assignments for module ${module.id}:`, error);
        }
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(`Failed to load assignments: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        setError(error.message || 'Failed to load assignments. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/modules/instructor/modules/${selectedModule}/assignments/`,
        {
          title: assignmentTitle,
          description: assignmentDescription,
          due_date: dueDate,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Assignment created:', response.data);
      setOpenDialog(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError('Failed to create assignment. Please try again.');
    }
  };

  const handleDeleteAssignment = async (moduleId, assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/api/modules/instructor/modules/${moduleId}/assignments/${assignmentId}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.status === 204) {
          fetchAssignments();
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
        setError('Failed to delete assignment. Please try again.');
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
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Assignments
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 3 }}
        >
          Create Assignment
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Module</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No assignments found. Create your first assignment!
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.module_title}</TableCell>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>{new Date(assignment.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary"
                        onClick={() => navigate(`/dashboard/instructor/assignments/${assignment.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteAssignment(assignment.module, assignment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Module</InputLabel>
            <Select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              label="Module"
            >
              {modules.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Title"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={assignmentDescription}
            onChange={(e) => setAssignmentDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAssignment} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Assignments; 