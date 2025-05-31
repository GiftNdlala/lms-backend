import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Grid,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import studentApi from '../../services/studentApi';

const QuizAttempt = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Get questions and quiz info
        const res = await studentApi.getQuizQuestions(quizId);
        const quizDetails = await studentApi.getQuizzes();
        const quiz = (quizDetails.quizzes || []).find(q => q.id === parseInt(quizId));
        setQuestions(res.questions || []);
        setQuizInfo(quiz);
        setTimer(quiz ? Math.round(quiz.time_limit * 60) : 0); // time_limit in minutes -> seconds
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz.');
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Timer logic
  const handleSubmit = useCallback(async () => {
    if (!isStarted) return; // Don't submit if quiz hasn't started
    
    try {
      setLoading(true);
      // Prepare answers in backend format
      const formatted = questions.map(q => {
        const ans = answers[q.id];
        if (q.question_type === 'MCQ') {
          return { question_id: q.id, answers: Array.isArray(ans) ? ans : [ans] };
        } else if (q.question_type === 'TF') {
          return { question_id: q.id, answer: ans };
        } else {
          return { question_id: q.id, answer: ans };
        }
      });
      const result = await studentApi.submitQuizAttempt(attemptId, formatted);
      // If wallet info is returned, update it in localStorage for ewallet page to pick up
      if (result.wallet) {
        localStorage.setItem('ewallet_balance', result.wallet.balance);
        localStorage.setItem('ewallet_transactions', JSON.stringify(result.wallet.transactions));
      }
      setSubmitSuccess(true);
      setLoading(false);
      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/dashboard/student/grades');
      }, 2000);
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      setLoading(false);
    }
  }, [answers, questions, attemptId, navigate, isStarted]);

  useEffect(() => {
    if (isStarted && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (isStarted && timer === 0 && !loading) {
      handleSubmit();
    }
    return () => clearTimeout(timerRef.current);
  }, [timer, loading, handleSubmit, isStarted]);

  const handleStartQuiz = () => {
    setIsStarted(true);
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    setCurrent((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrev = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>;
  }
  if (error) {
    return <Box mt={2}><Alert severity="error">{error}</Alert></Box>;
  }
  if (submitSuccess) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="success.main">
            Quiz Submitted Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            Your answers have been recorded. Redirecting to grades page...
          </Typography>
          <CircularProgress size={24} sx={{ mt: 2 }} />
        </Paper>
      </Box>
    );
  }
  if (!quizInfo || questions.length === 0) {
    return <Box mt={2}><Alert severity="info">No questions found for this quiz.</Alert></Box>;
  }

  if (!isStarted) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>Quiz Instructions</Typography>
          <Typography variant="body1" paragraph>
            {quizInfo.description}
          </Typography>
          <Typography variant="body1" paragraph>
            • Time Limit: {quizInfo.time_limit} minutes
          </Typography>
          <Typography variant="body1" paragraph>
            • Total Questions: {questions.length}
          </Typography>
          <Typography variant="body1" paragraph>
            • Total Points: {quizInfo.total_points}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStartQuiz}
            sx={{ mt: 2 }}
          >
            Begin Quiz
          </Button>
        </Paper>
      </Box>
    );
  }

  const q = questions[current];
  const total = questions.length;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">{quizInfo.title}</Typography>
            <Typography color="primary" fontWeight={600}>
              {formatTime(timer)} remaining
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={((current + 1) / total) * 100} sx={{ mb: 2 }} />
          <Typography variant="subtitle1" mb={1}>
            Question {current + 1} of {total}
          </Typography>
          <Typography variant="body1" mb={2}>{q.question_text}</Typography>
          <Typography variant="caption" color="text.secondary" mb={2} display="block">
            {q.points} Point{q.points !== 1 ? 's' : ''}
          </Typography>
          {/* Render answer input based on type */}
          {q.question_type === 'MCQ' && (
            <Box>
              {q.choices.map((choice) => (
                <Button
                  key={choice.id}
                  variant={answers[q.id] === choice.text ? 'contained' : 'outlined'}
                  sx={{ mr: 1, mb: 1 }}
                  onClick={() => handleAnswer(q.id, choice.text)}
                >
                  {choice.text}
                </Button>
              ))}
            </Box>
          )}
          {q.question_type === 'TF' && (
            <Box>
              {['True', 'False'].map((val) => (
                <Button
                  key={val}
                  variant={answers[q.id] === val ? 'contained' : 'outlined'}
                  sx={{ mr: 1, mb: 1 }}
                  onClick={() => handleAnswer(q.id, val)}
                >
                  {val}
                </Button>
              ))}
            </Box>
          )}
          {q.question_type === 'SA' && (
            <Box>
              <textarea
                style={{ width: '100%', minHeight: 80, fontSize: 16, padding: 8 }}
                value={answers[q.id] || ''}
                onChange={e => handleAnswer(q.id, e.target.value)}
                placeholder="Type your answer here..."
              />
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Button disabled={current === 0} onClick={handlePrev}>Previous</Button>
            {current < total - 1 ? (
              <Button variant="contained" onClick={handleNext}>Next</Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleSubmit}>Submit</Button>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>Quiz Details</Typography>
          <Typography variant="body2"><b>Time limit:</b> {quizInfo.time_limit} minutes</Typography>
          <Typography variant="body2"><b>Total questions:</b> {total}</Typography>
          <Typography variant="body2"><b>Total points:</b> {quizInfo.total_points}</Typography>
          <Typography variant="body2"><b>Status:</b> {timer > 0 ? 'In Progress' : 'Submitted'}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default QuizAttempt; 