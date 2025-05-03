import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Avatar, 
  TextField, 
  Button, 
  IconButton,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import './StudentAnnouncementChat.css';

// Mock data for the announcement and comments
const mockAnnouncement = {
  id: 1,
  title: 'Assessment 1 Results Released',
  content: `Dear students,

The results for Assessment 1 have been posted. Please check your gradebook for detailed feedback. If you have any questions, feel free to reach out during office hours.

Key Points:
- Average score: 75%
- Highest score: 95%
- Common areas for improvement have been noted
- Individual feedback is available in the gradebook

Office Hours:
Monday & Wednesday: 14:00 - 16:00
Thursday: 10:00 - 12:00

Best regards,
Dr. Smith`,
  date: 'Today at 9:59 AM',
  instructor: {
    name: 'Dr. Smith',
    avatar: null,
    role: 'Course Instructor'
  },
  comments: [
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: null,
        role: 'Student'
      },
      content: 'Thank you for the feedback. Could you please clarify the requirements for the next assessment?',
      date: 'Today at 10:15 AM'
    },
    {
      id: 2,
      user: {
        name: 'Dr. Smith',
        avatar: null,
        role: 'Instructor'
      },
      content: 'I will post the detailed requirements for Assessment 2 by tomorrow. Please check the announcements.',
      date: 'Today at 10:30 AM'
    }
  ]
};

const CommentItem = ({ comment }) => (
  <Box sx={{ mb: 2 }}>
    <Box display="flex" gap={2}>
      <Avatar sx={{ bgcolor: comment.user.role === 'Instructor' ? '#8231D2' : '#1976d2' }}>
        {comment.user.name[0]}
      </Avatar>
      <Box flexGrow={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {comment.user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {comment.user.role}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {comment.date}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {comment.content}
        </Typography>
      </Box>
    </Box>
  </Box>
);

const StudentAnnouncementChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch announcement data using the id
    const fetchAnnouncement = async () => {
      try {
        // Simulate API call
        const mockAnnouncement = {
          id: id,
          title: 'Sample Announcement',
          content: 'This is a sample announcement content.',
          date: new Date().toISOString(),
          author: 'Instructor Name'
        };
        setAnnouncement(mockAnnouncement);
      } catch (error) {
        console.error('Error fetching announcement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard/student/announcements');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // In a real app, this would be an API call
    console.log('Submitting comment:', newComment);
    setNewComment('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!announcement) {
    return <div>Announcement not found</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="600">
          Announcement Details
        </Typography>
      </Box>

      {/* Announcement Content */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" gap={2}>
          <Avatar sx={{ bgcolor: '#8231D2', width: 56, height: 56 }}>
            {announcement.instructor.name[0]}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" fontWeight="600" mb={1}>
              {announcement.title}
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <Typography variant="caption" color="text.secondary">
                {announcement.instructor.name} • {announcement.instructor.role}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {announcement.date}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {announcement.content}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Comments Section */}
      <Typography variant="h6" mb={3}>
        Comments ({announcement.comments.length})
      </Typography>

      <Box mb={4}>
        {announcement.comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </Box>

      {/* Comment Input */}
      <Paper sx={{ p: 2, position: 'sticky', bottom: 0, bgcolor: 'background.paper' }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Write a comment..."
              size="small"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <IconButton color="primary">
              <AttachFileIcon />
            </IconButton>
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              type="submit"
              disabled={!newComment.trim()}
            >
              Send
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default StudentAnnouncementChat;
