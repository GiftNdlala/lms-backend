import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateAssignment = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module: '',
    due_date: '',
    pdf_file: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/modules/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setModules(response.data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      setError('Failed to load modules. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      pdf_file: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('due_date', formData.due_date);
      if (formData.pdf_file) {
        formDataToSend.append('pdf_file', formData.pdf_file);
      }

      await axios.post(
        `http://localhost:8000/api/modules/${formData.module}/assignments/`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      navigate('/dashboard/instructor/assignments');
    } catch (error) {
      console.error('Failed to create assignment:', error);
      setError('Failed to create assignment. Please try again.');
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
        Create Assignment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Module</InputLabel>
                <Select
                  name="module"
                  value={formData.module}
                  onChange={handleChange}
                  label="Module"
                >
                  {modules.map((module) => (
                    <MenuItem key={module.id} value={module.id}>
                      {module.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
              >
                Upload PDF
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {formData.pdf_file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {formData.pdf_file.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Create Assignment
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateAssignment; 