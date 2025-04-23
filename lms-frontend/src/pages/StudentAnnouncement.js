import React, { useState } from 'react';
import { Box, Typography, Container, Paper, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

const AnnouncementItem = ({ title, description, date, instructor, isUnread, onClick }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 3, 
      mb: 2, 
      borderRadius: '8px',
      border: '1px solid #eee',
      '&:hover': { 
        backgroundColor: '#f5f5f5',
        cursor: 'pointer'
      }
    }}
    onClick={onClick}
  >
    <Box display="flex" alignItems="flex-start" gap={2}>
      {isUnread && (
        <Box 
          sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: '#8231D2',
            mt: 1
          }} 
        />
      )}
      <Box flexGrow={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight="600">
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {description}
        </Typography>
        <Typography variant="caption" color="primary">
          Posted by: {instructor}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const StudentAnnouncement = () => {
  const navigate = useNavigate();
  const [announcements] = useState([
    {
      id: 1,
      title: 'Assessment 1 Results Released',
      description: 'Dear students, the results for Assessment 1 have been posted. Please check your gradebook for detailed feedback. If you have any questions, feel free to reach out during office hours.',
      date: 'Today at 9:59 AM',
      instructor: 'Dr. Smith',
      isUnread: true
    },
    {
      id: 2,
      title: 'Important: JDBC Practical Session Recordings',
      description: 'The recordings from our recent JDBC practical sessions are now available on Class Collaborate. Please review them before our next practical session.',
      date: '14 Apr, 8:52 AM',
      instructor: 'Prof. Johnson',
      isUnread: true
    },
    {
      id: 3,
      title: 'Assessment 1 Opportunity 2 Schedule Update',
      description: 'Due to the ongoing marking process of Opportunity 1, Opportunity 2 will be postponed. New dates will be communicated soon.',
      date: '10 Apr, 10:04 AM',
      instructor: 'Dr. Williams',
      isUnread: false
    }
  ]);

  const handleAnnouncementClick = (id) => {
    navigate(`/dashboard/student/announcements/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="600" mb={1}>
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with important course announcements
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
          <IconButton>
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      <Box>
        {announcements.map((announcement) => (
          <AnnouncementItem
            key={announcement.id}
            {...announcement}
            onClick={() => handleAnnouncementClick(announcement.id)}
          />
        ))}
      </Box>
    </Container>
  );
};

export default StudentAnnouncement; 