import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

const ManageAssignments = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    pdf_file: null,
    questions: [{ text: '', answer: '', type: 'true_false' }]
  });

  useEffect(() => {
    fetchModuleAndAssignments();
  }, [moduleId]);

  const fetchModuleAndAssignments = async () => {
    try {
      setLoading(true);
      const [moduleResponse, assignmentsResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/modules/${moduleId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }),
        axios.get(`http://localhost:8000/api/modules/${moduleId}/assignments/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
      ]);
      setModule(moduleResponse.data);
      setAssignments(assignmentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleFileChange = (event) => {
    setFormData({
      ...formData,
      pdf_file: event.target.files[0]
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { text: '', answer: '', type: 'true_false' }]
    });
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('due_date', formData.due_date);
      formDataToSend.append('module', moduleId);
      if (formData.pdf_file) {
        formDataToSend.append('pdf_file', formData.pdf_file);
      }
      formDataToSend.append('questions', JSON.stringify(formData.questions));

      await axios.post('http://localhost:8000/api/assignments/', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowAssignmentDialog(false);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        pdf_file: null,
        questions: [{ text: '', answer: '', type: 'true_false' }]
      });
      fetchModuleAndAssignments();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      setError('Failed to create assignment. Please try again.');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(`http://localhost:8000/api/assignments/${assignmentId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      fetchModuleAndAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      setError('Failed to delete assignment. Please try again.');
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Manage Assignments - {module?.title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAssignmentDialog(true)}
        >
          Create New Assignment
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Assignments" />
          <Tab label="Quizzes" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.description}</TableCell>
                  <TableCell>{new Date(assignment.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={showAssignmentDialog}
        onClose={() => setShowAssignmentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2 }}
          >
            Upload PDF
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={handleFileChange}
            />
          </Button>

          <Typography variant="h6" sx={{ mt: 3 }}>
            Quiz Questions
          </Typography>
          {formData.questions.map((question, index) => (
            <Box key={index} sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
              <TextField
                margin="dense"
                label="Question"
                fullWidth
                value={question.text}
                onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
              />
              <TextField
                margin="dense"
                label="Answer (True/False)"
                fullWidth
                value={question.answer}
                onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
              />
            </Box>
          ))}
          <Button
            variant="outlined"
            onClick={addQuestion}
            sx={{ mt: 2 }}
          >
            Add Question
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignmentDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageAssignments; 