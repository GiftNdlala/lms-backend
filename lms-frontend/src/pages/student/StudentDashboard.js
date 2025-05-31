import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { FaBook, FaGraduationCap, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import StudentNotifications from '../../components/StudentNotifications';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    upcomingAssignments: 0,
    pendingAssignments: 0,
    totalModules: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/student/dashboard/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default stats if API call fails
        setStats({
          enrolledCourses: 0,
          completedCourses: 0,
          upcomingAssignments: 0,
          pendingAssignments: 0,
          totalModules: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <FaBook size={40} color="#1976d2" />
            <Typography variant="h6" mt={2}>Enrolled Courses</Typography>
            <Typography variant="h4">{stats.enrolledCourses}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <FaGraduationCap size={40} color="#2e7d32" />
            <Typography variant="h6" mt={2}>Completed Courses</Typography>
            <Typography variant="h4">{stats.completedCourses}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <FaCalendarAlt size={40} color="#ed6c02" />
            <Typography variant="h6" mt={2}>Upcoming Assignments</Typography>
            <Typography variant="h4">{stats.upcomingAssignments}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <FaFileAlt size={40} color="#d32f2f" />
            <Typography variant="h6" mt={2}>Pending Assignments</Typography>
            <Typography variant="h4">{stats.pendingAssignments}</Typography>
          </Paper>
        </Grid>
        
        {/* Notifications Section */}
        <Grid item xs={12}>
          <StudentNotifications />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard; 