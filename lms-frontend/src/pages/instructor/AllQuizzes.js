import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';

const AllQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await instructorApi.getAllQuizzes();
        setQuizzes(response.quizzes || []); // Access the quizzes array from response
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch quizzes. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await instructorApi.deleteQuiz(quizId);
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      } catch (err) {
        setError('Failed to delete quiz. Please try again.');
      }
    }
  };

  const formatTimeLimit = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} minutes` : ''}`;
  };

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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          All Quizzes
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Time Limit</TableCell>
              <TableCell>Total Points</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell>{quiz.title}</TableCell>
                <TableCell>{quiz.module?.title || 'No Module'}</TableCell>
                <TableCell>{formatTimeLimit(quiz.time_limit)}</TableCell>
                <TableCell>{quiz.total_points}</TableCell>
                <TableCell>
                  <Chip
                    label={quiz.is_published ? 'Published' : 'Draft'}
                    color={quiz.is_published ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/instructor/quiz/${quiz.id}`)}
                    title="View Quiz"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/instructor/quiz/${quiz.id}/edit`)}
                    title="Edit Quiz"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(quiz.id)}
                    title="Delete Quiz"
                  >
                    <DeleteIcon />
                  </IconButton>
                  {!quiz.is_published && (
                    <Button
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ ml: 1 }}
                      onClick={async () => {
                        try {
                          await instructorApi.publishQuiz(quiz.id);
                          setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, is_published: true } : q));
                        } catch (err) {
                          setError('Failed to publish quiz. Please try again.');
                        }
                      }}
                    >
                      Publish
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllQuizzes; 