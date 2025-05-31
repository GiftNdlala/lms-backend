import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentPages.css';
import studentApi from '../services/studentApi';
import { List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Box } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const StudentAnnouncement = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await studentApi.getNotifications();
        setNotifications(response);
      } catch (error) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) {
    return <div className="loading">Loading announcements...</div>;
  }

  return (
    <Box className="page-container">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={700} gutterBottom>Announcements</Typography>
        <Typography variant="body1" color="textSecondary">
          Stay updated with important information from your modules
        </Typography>
      </Box>
      <List sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        {notifications.length === 0 && (
          <Box className="empty-state" p={3} textAlign="center">
            <Typography color="textSecondary">No announcements at this time.</Typography>
          </Box>
        )}
        {notifications.map((notification, idx) => (
          <React.Fragment key={notification.id}>
            <ListItem
              button
              alignItems="flex-start"
              onClick={() => navigate(`/dashboard/student/announcements/${notification.id}`)}
              sx={{
                '&:hover': { bgcolor: 'action.hover' },
                display: 'flex',
                alignItems: 'center',
                py: 2
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <NotificationsActiveIcon color="primary" fontSize="large" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight={700} noWrap color="#222">
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="#555"
                      noWrap
                      sx={{ maxWidth: 400 }}
                    >
                      {notification.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="#888"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="#1976d2"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      Module: <b>{notification.module_name || 'Unknown Module'}</b>
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {idx < notifications.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default StudentAnnouncement;