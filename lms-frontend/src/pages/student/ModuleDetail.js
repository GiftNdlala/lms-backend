import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Avatar, Typography, Button, Tabs, Tab, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import studentApi from '../../services/studentApi';

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchModuleData();
    // eslint-disable-next-line
  }, [moduleId]);

  const fetchModuleData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [moduleData, announcementsData] = await Promise.all([
        studentApi.getModuleDetails(moduleId),
        studentApi.getModuleAnnouncements ? studentApi.getModuleAnnouncements(moduleId) : []
      ]);
      if (!moduleData || Object.keys(moduleData).length === 0) {
        setMessage('Module not found. It may not exist or you may not have access.');
        setModule(null);
      } else {
        setModule(moduleData);
        setAnnouncements(announcementsData || []);
      }
    } catch (error) {
      console.error('Error fetching module data:', error);
      if (error.response && error.response.status === 404) {
        setMessage('Module not found (404).');
      } else if (error.message) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Failed to load module data due to a network or server error.');
      }
      setModule(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (contentId, fileName) => {
    try {
      const response = await window.api.student.downloadContent(moduleId, contentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage('Failed to download file');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (!module) {
    return <div className="error">{message || 'Module not found'}</div>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, mb: 6 }}>
      {/* Module Header */}
      <Paper elevation={3} sx={{ p: 4, display: 'flex', alignItems: 'center', mb: 4, borderRadius: 3, background: 'linear-gradient(90deg, #e3f2fd 0%, #fff 100%)' }}>
        <Avatar sx={{ bgcolor: '#1976d2', width: 64, height: 64, mr: 3 }}>
          <MenuBookIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1a237e" gutterBottom>{module.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{module.description}</Typography>
        </Box>
      </Paper>
      {message && (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: '#fffde7', color: '#f9a825' }}>{message}</Paper>
        </Box>
      )}
      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Content" />
        <Tab label="Announcements" />
        <Tab label="Quizzes" />
      </Tabs>
      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} mb={2}>Learning Materials</Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {(!module.sections || module.sections.length === 0) && (
              <Typography color="textSecondary">No content available for this module yet.</Typography>
            )}
            {module.sections && module.sections.map((section) => (
              <Accordion key={section.id} elevation={1} sx={{ borderRadius: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight={600}>{section.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" mb={2}>{section.description}</Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {section.contents && section.contents.length > 0 ? (
                      section.contents.map((content) => (
                        <Paper key={content.id} elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', border: '1px solid #e3e3e3', borderRadius: 1, mb: 1 }}>
                          <DescriptionIcon sx={{ color: '#1976d2', mr: 2 }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" fontWeight={500}>{content.title} {content.file && <a href={content.file} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', marginLeft: 8 }}>[File]</a>}</Typography>
                            {content.text_content && <Typography variant="body2" color="text.secondary">{content.text_content}</Typography>}
                          </Box>
                          {content.file && (
                            <IconButton onClick={() => handleDownload(content.id, content.title)} color="primary" title="Download file">
                              <DownloadIcon />
                            </IconButton>
                          )}
                        </Paper>
                      ))
                    ) : (
                      <Typography color="textSecondary">No content in this section.</Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      )}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={600} mb={2} display="flex" alignItems="center"><AnnouncementIcon sx={{ mr: 1 }} />Announcements</Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {announcements.length === 0 && (
              <Typography color="textSecondary">No announcements for this module yet.</Typography>
            )}
            {announcements.map((announcement) => (
              <Paper key={announcement.id} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} color="#222">
                  {announcement.title}
                </Typography>
                <Typography variant="body2" color="#555" mb={1}>
                  {announcement.content}
                </Typography>
                <Typography variant="caption" color="#888" sx={{ display: 'block', mt: 0.5 }}>
                  {new Date(announcement.created_at).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="#1976d2" sx={{ display: 'block', mt: 0.5 }}>
                  Module: <b>{announcement.module_name || 'Unknown Module'}</b>
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" fontWeight={600} mb={2}>Available Quizzes</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate(`/dashboard/student/modules/${moduleId}/quiz`)}>
            View Quizzes
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ModuleDetail; 