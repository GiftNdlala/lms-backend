import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Assignments = () => {
  const [modules, setModules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get('/api/modules/');
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const response = await axios.post(`/api/modules/${selectedModule}/assignments/`, {
        title: assignmentTitle,
        description: assignmentDescription,
        due_date: dueDate,
      });
      console.log('Assignment created:', response.data);
      setOpenDialog(false);
      // Refresh modules to show new assignment
      fetchModules();
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Assignments
        </Typography>
        
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
              {modules.map((module) => (
                module.assignments?.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{module.title}</TableCell>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>{new Date(assignment.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ))}
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