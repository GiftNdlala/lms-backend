import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import { Box, Paper, Typography, TextField, Button, MenuItem, IconButton, Divider, FormControlLabel, Switch } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Answer' },
  { value: 'number', label: 'Numerical Answer' },
  { value: 'code', label: 'Code Answer' },
];

const defaultQuestion = () => ({
  text: '',
  type: 'text',
  points: 1,
  auto_grade: false,
  expected_answer: '',
  keywords: [], // For text answers
  tolerance: 0, // For numerical answers
});

const AddAssignment = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    moduleId: '',
    totalMarks: '',
  });
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await instructorApi.getModules();
        setModules(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };
    fetchModules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleAddKeyword = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].keywords.push('');
    setQuestions(updated);
  };

  const handleRemoveKeyword = (qIdx, kIdx) => {
    const updated = [...questions];
    updated[qIdx].keywords = updated[qIdx].keywords.filter((_, i) => i !== kIdx);
    setQuestions(updated);
  };

  const handleKeywordChange = (qIdx, kIdx, value) => {
    const updated = [...questions];
    updated[qIdx].keywords[kIdx] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // 1. Create the assignment
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.dueDate,
        module: formData.moduleId,
        total_marks: formData.totalMarks,
        questions: questions.map(q => ({
          question_text: q.text,
          question_type: q.type,
          points: q.points,
          auto_grade: q.auto_grade,
          expected_answer: q.expected_answer,
          keywords: q.keywords,
          tolerance: q.tolerance,
        })),
      };
      
      const response = await instructorApi.createAssignment(assignmentData);
      setMessage('Assignment created successfully!');
        navigate('/dashboard/instructor/assignments');
    } catch (err) {
      setMessage('Error creating assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={2}>Create Assignment</Typography>
        {message && <Typography color={message.includes('success') ? 'green' : 'red'} mb={2}>{message}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Assignment Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Due Date"
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Module"
            name="moduleId"
            value={formData.moduleId}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          >
            {modules.map(module => (
              <MenuItem key={module.id} value={module.id}>{module.title}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Total Marks"
            name="totalMarks"
            type="number"
            value={formData.totalMarks}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" mb={1}>Questions</Typography>
          {questions.map((q, qIdx) => (
            <Paper key={qIdx} elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <TextField
                  label={`Question ${qIdx + 1}`}
                  value={q.text}
                  onChange={e => handleQuestionChange(qIdx, 'text', e.target.value)}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  select
                  label="Type"
                  value={q.type}
                  onChange={e => handleQuestionChange(qIdx, 'type', e.target.value)}
                  sx={{ width: 160, mb: 2 }}
                >
                  {QUESTION_TYPES.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Points"
                  type="number"
                  value={q.points}
                  onChange={e => handleQuestionChange(qIdx, 'points', parseInt(e.target.value))}
                  sx={{ width: 100, mb: 2 }}
                />
                <IconButton onClick={() => handleRemoveQuestion(qIdx)} color="error" title="Remove Question">
                  <DeleteIcon />
                </IconButton>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={q.auto_grade}
                    onChange={e => handleQuestionChange(qIdx, 'auto_grade', e.target.checked)}
                  />
                }
                label="Enable Auto-grading"
                sx={{ mb: 2 }}
              />

              {q.auto_grade && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" mb={1}>Grading Criteria</Typography>
                  
                  {q.type === 'text' && (
                    <>
                      <TextField
                        label="Expected Answer"
                        value={q.expected_answer}
                        onChange={e => handleQuestionChange(qIdx, 'expected_answer', e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="subtitle2" mb={1}>Keywords (for partial credit)</Typography>
                      {q.keywords.map((keyword, kIdx) => (
                        <Box key={kIdx} display="flex" alignItems="center" gap={2} mb={1}>
                          <TextField
                            label={`Keyword ${kIdx + 1}`}
                            value={keyword}
                            onChange={e => handleKeywordChange(qIdx, kIdx, e.target.value)}
                            sx={{ width: 300 }}
                          />
                          <IconButton onClick={() => handleRemoveKeyword(qIdx, kIdx)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleAddKeyword(qIdx)}
                        sx={{ mt: 1 }}
                      >
                        Add Keyword
                      </Button>
                    </>
                  )}

                  {q.type === 'number' && (
                    <TextField
                      label="Tolerance (±)"
                      type="number"
                      value={q.tolerance}
                      onChange={e => handleQuestionChange(qIdx, 'tolerance', parseFloat(e.target.value))}
                      sx={{ width: 200 }}
                    />
                  )}
                </>
              )}
            </Paper>
          ))}

          <Button
            startIcon={<AddCircleIcon />}
            onClick={handleAddQuestion}
            sx={{ mt: 2, mb: 3 }}
          >
            Add Question
          </Button>

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/instructor/assignments')}
            >
            Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
            Create Assignment
            </Button>
          </Box>
      </form>
      </Paper>
    </Box>
  );
};

export default AddAssignment; 