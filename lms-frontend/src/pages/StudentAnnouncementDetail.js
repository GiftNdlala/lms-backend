import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import studentApi from '../services/studentApi';

const StudentAnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const data = await studentApi.getNotificationDetails(id);
        setNotification(data);
      } catch (error) {
        setNotification(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!notification) {
    return (
      <Box p={3}>
        <Typography color="error">Announcement not found.</Typography>
        <Button onClick={() => navigate(-1)} variant="contained" sx={{ mt: 2 }}>
          Back to Announcements
        </Button>
      </Box>
    );
  }

  return (
    <Box className="page-container" maxWidth="md" mx="auto">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <NotificationsActiveIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>
            {notification.title}
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="textSecondary" mb={2}>
          {new Date(notification.created_at).toLocaleString()}
          {notification.module && ` • ${notification.module.title || notification.module.code}`}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
          {notification.content}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          From: {notification.created_by_name}
        </Typography>
        <Button onClick={() => navigate(-1)} variant="outlined" sx={{ mt: 3 }}>
          Back to Announcements
        </Button>
      </Paper>
    </Box>
  );
};

export default StudentAnnouncementDetail; 