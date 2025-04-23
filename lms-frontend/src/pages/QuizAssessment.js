import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Tabs, Tab, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const StyledTab = styled(Tab)({
  textTransform: 'none',
  minWidth: 0,
  '&.Mui-selected': {
    color: '#8231D2',
    borderBottom: '2px solid #8231D2',
  },
});

const AnnouncementItem = ({ title, description, date, isUnread }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 2, 
      mb: 2, 
      borderBottom: '1px solid #eee',
      '&:hover': { backgroundColor: '#f5f5f5' }
    }}
  >
    <Box display="flex" alignItems="center" gap={2}>
      {isUnread && (
        <Box 
          sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: '#8231D2' 
          }} 
        />
      )}
      <Box flexGrow={1}>
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {date}
      </Typography>
    </Box>
  </Paper>
);

const QuizAssessment = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [announcements] = useState([
    {
      title: 'Assessment 1 results',
      description: 'Dear Development 3.1 student, Your marks for assessment 1 have been posted. Calculate your final mark for the assessment...',
      date: 'an hour ago, at 9:59 AM',
      isUnread: true
    },
    {
      title: 'JDBC Recordings',
      description: 'Good morning student Three recordings have been made available to you on Class Collaborate. Please watch and create the a...',
      date: '4/14/25, 8:52 AM',
      isUnread: true
    },
    {
      title: 'Assessment1 Opp2 Postponement',
      description: 'Dear Development Software 3.1 student I have not been able to complete the marking of Assessment1 Opp1, will therefore fin...',
      date: '4/10/25, 10:04 AM',
      isUnread: true
    }
  ]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          aria-label="assessment tabs"
        >
          <StyledTab label="Content" component={Link} to="/dashboard/student/courses" />
          <StyledTab label={`Announcements`} component={Link} to="/dashboard/student/announcements" />
          <StyledTab label="Gradebook" component={Link} to="/dashboard/student/grades" />
          <StyledTab label="Messages" component={Link} to="/dashboard/student/messages" />
        </Tabs>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2">
          {announcements.length} Total
        </Typography>
        <IconButton>
          <SearchIcon />
        </IconButton>
      </Box>

      <Box>
        {announcements.map((announcement, index) => (
          <AnnouncementItem
            key={index}
            title={announcement.title}
            description={announcement.description}
            date={announcement.date}
            isUnread={announcement.isUnread}
          />
        ))}
      </Box>
    </Container>
  );
};

export default QuizAssessment;
