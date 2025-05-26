import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

const EditAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    total_marks: 100,
    module: '',
    file: null
  });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignment, modulesList] = await Promise.all([
          instructorApi.getAssignmentDetails(id),
          instructorApi.getModules()
        ]);
        setFormData({
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date ? assignment.due_date.slice(0, 16) : '',
          total_marks: assignment.total_marks,
          module: assignment.module?.id || '',
          file: null
        });
        setModules(modulesList);
      } catch (err) {
        setError('Failed to load assignment or modules');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('due_date', formData.due_date);
      data.append('total_marks', formData.total_marks);
      data.append('module', formData.module);
      if (formData.file) data.append('file', formData.file);
      await instructorApi.updateAssignment(id, data);
      navigate('/dashboard/instructor/assignments');
    } catch (err) {
      setError('Failed to update assignment');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Edit Assignment</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={4} required sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Module</InputLabel>
            <Select name="module" value={formData.module} onChange={handleChange} label="Module" required>
              {modules.map(module => (
                <MenuItem key={module.id} value={module.id}>{module.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Due Date" name="due_date" type="datetime-local" value={formData.due_date} onChange={handleChange} required InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
          <TextField fullWidth label="Total Marks" name="total_marks" type="number" value={formData.total_marks} onChange={handleChange} required sx={{ mb: 2 }} />
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/dashboard/instructor/assignments')}>Cancel</Button>
            <Button variant="contained" color="primary" type="submit" disabled={updating}>{updating ? 'Saving...' : 'Save Changes'}</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditAssignment; 