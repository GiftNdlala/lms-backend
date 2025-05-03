import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid
} from '@mui/material';
import axios from 'axios';

const AssignmentDetail = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/assignments/${id}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }),
        axios.get(`http://localhost:8000/api/assignments/${id}/submissions/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
      ]);
      setAssignment(assignmentResponse.data);
      setSubmissions(submissionsResponse.data);
    } catch (error) {
      console.error('Failed to fetch assignment details:', error);
      setError('Failed to load assignment details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId, score) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/submissions/${submissionId}/`,
        { score },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      fetchAssignmentDetails();
    } catch (error) {
      console.error('Failed to grade submission:', error);
      setError('Failed to grade submission. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Alert severity="error">
        Assignment not found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              {assignment.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {assignment.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Due Date: {new Date(assignment.due_date).toLocaleString()}
            </Typography>
            {assignment.pdf_file && (
              <Button
                variant="outlined"
                href={assignment.pdf_file_url}
                target="_blank"
                sx={{ mt: 2 }}
              >
                View PDF
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Submissions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.student_name}</TableCell>
                      <TableCell>
                        {new Date(submission.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{submission.status}</TableCell>
                      <TableCell>
                        {submission.score !== null ? submission.score : 'Not graded'}
                      </TableCell>
                      <TableCell>
                        {submission.pdf_file && (
                          <Button
                            variant="outlined"
                            href={submission.pdf_file_url}
                            target="_blank"
                            sx={{ mr: 1 }}
                          >
                            View Submission
                          </Button>
                        )}
                        {submission.status === 'submitted' && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              const score = prompt('Enter score:');
                              if (score !== null) {
                                handleGradeSubmission(submission.id, parseFloat(score));
                              }
                            }}
                          >
                            Grade
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssignmentDetail; 