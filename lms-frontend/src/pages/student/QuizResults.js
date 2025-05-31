import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import studentApi from '../../services/studentApi';

const QuizResults = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await studentApi.getQuizResults(attemptId);
        setResults(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz results');
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!results) {
    return (
      <Box mt={2}>
        <Alert severity="info">No results found for this quiz attempt.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Score Summary
              </Typography>
              <Typography variant="body1">
                Your Score: {results.score} / {results.max_score} points
              </Typography>
              <Typography variant="body1">
                Percentage: {results.score_percentage.toFixed(1)}%
              </Typography>
              <Typography variant="body1">
                Completed at: {new Date(results.completed_at).toLocaleString()}
              </Typography>
            </Box>
          </Grid>

          {results.achievement && (
            <Grid item xs={12}>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Achievement Unlocked!
                </Typography>
                <Typography variant="body1">
                  {results.achievement.title}
                </Typography>
                <Typography variant="body2">
                  {results.achievement.description}
                </Typography>
                <Typography variant="body2">
                  Points Awarded: {results.achievement.points}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onClick={() => navigate('/student/quizzes')}
              >
                Back to Quizzes
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate(`/student/module/${results.module_id}`)}
              >
                Return to Module
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default QuizResults; 