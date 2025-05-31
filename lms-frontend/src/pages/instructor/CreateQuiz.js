import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import { Box, Paper, Typography, TextField, Button, MenuItem, IconButton, Divider } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

const QUESTION_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'TF', label: 'True/False' },
];

const defaultQuestion = () => ({
  text: '',
  type: 'MCQ',
  points: 1, // Total points for the question
  points_per_correct: 1, // Points per correct answer
  choices: [{ text: '', is_correct: false }],
});

const CreateQuiz = () => {
  const { moduleId } = useParams();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30); // in minutes
  const [passingScore, setPassingScore] = useState(60); // percentage
  const [rewardPoints, setRewardPoints] = useState(0);
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    if (field === 'type' && value === 'TF') {
      updated[idx].choices = [
        { text: 'True', is_correct: false },
        { text: 'False', is_correct: false },
      ];
    }
    setQuestions(updated);
  };

  const handleChoiceChange = (qIdx, cIdx, field, value) => {
    const updated = [...questions];
    updated[qIdx].choices[cIdx][field] = value;
    setQuestions(updated);
  };

  const handleAddChoice = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].choices.push({ text: '', is_correct: false });
    setQuestions(updated);
  };

  const handleRemoveChoice = (qIdx, cIdx) => {
    const updated = [...questions];
    updated[qIdx].choices = updated[qIdx].choices.filter((_, i) => i !== cIdx);
    setQuestions(updated);
  };

  const handleCorrectChange = (qIdx, cIdx) => {
    const updated = [...questions];
    if (questions[qIdx].type === 'MCQ') {
      // For MCQ, allow multiple correct answers
      updated[qIdx].choices[cIdx].is_correct = !updated[qIdx].choices[cIdx].is_correct;
    } else if (questions[qIdx].type === 'TF') {
      // For True/False, only one answer can be correct
      updated[qIdx].choices = updated[qIdx].choices.map((choice, i) => ({
        ...choice,
        is_correct: i === cIdx,
      }));
    }
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // 1. Create the quiz
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        time_limit: timeLimit * 60, // convert to seconds
        passing_score: passingScore,
        reward_points: rewardPoints,
        total_points: questions.reduce((sum, q) => sum + q.points, 0)
      };
      const quiz = await instructorApi.createQuiz(moduleId, quizData);
      
      // 2. Add questions
      for (const q of questions) {
        const questionData = {
          question_text: q.text,
          question_type: q.type,
          points: q.points,
          points_per_correct: q.points_per_correct,
          choices: q.choices.map(choice => ({
            text: choice.text,
            is_correct: choice.is_correct
          }))
        };
        await instructorApi.addQuizQuestion(quiz.id, questionData);
      }
      setMessage('Quiz created successfully!');
      setQuizTitle('');
      setQuizDescription('');
      setTimeLimit(30);
      setPassingScore(60);
      setRewardPoints(0);
      setQuestions([defaultQuestion()]);
    } catch (err) {
      setMessage('Error creating quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={2}>Create Quiz</Typography>
        {message && <Typography color={message.includes('success') ? 'green' : 'red'} mb={2}>{message}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Quiz Title"
            value={quizTitle}
            onChange={e => setQuizTitle(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quiz Description"
            value={quizDescription}
            onChange={e => setQuizDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={2} sx={{ mb: 3 }}>
            <TextField
              label="Time Limit (minutes)"
              type="number"
              value={timeLimit}
              onChange={e => setTimeLimit(Number(e.target.value))}
              required
              sx={{ width: 200 }}
            />
            <TextField
              label="Passing Score (%)"
              type="number"
              value={passingScore}
              onChange={e => setPassingScore(Number(e.target.value))}
              required
              inputProps={{ min: 0, max: 100 }}
              sx={{ width: 200 }}
            />
            <TextField
              label="Reward Points"
              type="number"
              value={rewardPoints}
              onChange={e => setRewardPoints(Number(e.target.value))}
              required
              inputProps={{ min: 0 }}
              sx={{ width: 200 }}
            />
          </Box>
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
                  label="Total Points"
                  type="number"
                  value={q.points}
                  onChange={e => handleQuestionChange(qIdx, 'points', Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{ width: 100, mb: 2 }}
                />
                {q.type === 'MCQ' && (
                  <TextField
                    label="Points per Correct"
                    type="number"
                    value={q.points_per_correct}
                    onChange={e => handleQuestionChange(qIdx, 'points_per_correct', Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ width: 120, mb: 2 }}
                  />
                )}
                <IconButton onClick={() => handleRemoveQuestion(qIdx)} color="error" title="Remove Question">
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" mb={1}>Answers</Typography>
              {q.choices.map((choice, cIdx) => (
                <Box key={cIdx} display="flex" alignItems="center" gap={2} mb={1}>
                  <TextField
                    label={q.type === 'TF' ? '' : `Option ${cIdx + 1}`}
                    value={choice.text}
                    onChange={e => handleChoiceChange(qIdx, cIdx, 'text', e.target.value)}
                    disabled={q.type === 'TF'}
                    sx={{ width: 300 }}
                  />
                  <Button
                    variant={choice.is_correct ? 'contained' : 'outlined'}
                    color={choice.is_correct ? 'success' : 'primary'}
                    onClick={() => handleCorrectChange(qIdx, cIdx)}
                  >
                    {q.type === 'TF' ? (choice.text === 'True' ? 'True' : 'False') : 'Correct'}
                  </Button>
                  {q.type === 'MCQ' && (
                    <IconButton onClick={() => handleRemoveChoice(qIdx, cIdx)} color="error" title="Remove Option">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {q.type === 'MCQ' && (
                <Button
                  startIcon={<AddCircleIcon />}
                  onClick={() => handleAddChoice(qIdx)}
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
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
          <br />
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
            {loading ? 'Creating...' : 'Create Quiz'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateQuiz; 