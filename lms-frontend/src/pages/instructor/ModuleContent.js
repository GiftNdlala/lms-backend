import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import {
  Typography,
  IconButton,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import QuizIcon from '@mui/icons-material/Quiz';

const ModuleContent = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchModuleData();
    // eslint-disable-next-line
  }, [moduleId]);

  const fetchModuleData = async () => {
    setLoading(true);
    try {
      const moduleData = await instructorApi.getModuleDetails(moduleId);
      setModule(moduleData);
      const sectionData = await instructorApi.getSections(moduleId);
      setSections(sectionData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load module data' });
    } finally {
      setLoading(false);
    }
  };

  // Section CRUD
  const handleAddSection = () => {
    setEditSection(null);
    setSectionDialogOpen(true);
  };
  const handleEditSection = (section) => {
    setEditSection(section);
    setSectionDialogOpen(true);
  };
  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Delete this section and all its content?')) {
      await instructorApi.deleteSection(sectionId);
      fetchModuleData();
    }
  };
  const handleSectionDialogClose = async (refresh = false) => {
    setSectionDialogOpen(false);
    setEditSection(null);
    if (refresh) fetchModuleData();
  };

  // Content CRUD
  const handleAddContent = (sectionId) => {
    setEditContent(null);
    setCurrentSectionId(sectionId);
    setContentDialogOpen(true);
  };
  const handleEditContent = (content, sectionId) => {
    setEditContent(content);
    setCurrentSectionId(sectionId);
    setContentDialogOpen(true);
  };
  const handleDeleteContent = async (contentId) => {
    if (window.confirm('Delete this content item?')) {
      await instructorApi.deleteSectionContent(contentId);
      fetchModuleData();
    }
  };
  const handleContentDialogClose = async (refresh = false) => {
    setContentDialogOpen(false);
    setEditContent(null);
    setCurrentSectionId(null);
    if (refresh) fetchModuleData();
  };

  if (loading || !module) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, mb: 6 }}>
      {/* Module Header */}
      <Paper elevation={3} sx={{ p: 4, display: 'flex', alignItems: 'center', mb: 4, borderRadius: 3, background: 'linear-gradient(90deg, #e3f2fd 0%, #fff 100%)' }}>
        <Avatar sx={{ bgcolor: '#1976d2', width: 64, height: 64, mr: 3 }}>
          <MenuBookIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={700} color="#1a237e" gutterBottom>{module.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{module.description}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<QuizIcon />}
            onClick={() => window.location.href = `/dashboard/instructor/modules/${moduleId}/quiz`}
            sx={{ borderRadius: 2 }}
          >
            View Quizzes
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => window.location.href = `/dashboard/instructor/modules/${moduleId}/create-quiz`}
            sx={{ borderRadius: 2 }}
          >
            Create Quiz
          </Button>
        </Box>
      </Paper>
      {message.text && (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: message.type === 'error' ? '#ffebee' : '#e8f5e9', color: message.type === 'error' ? '#c62828' : '#2e7d32' }}>
            {message.text}
          </Paper>
        </Box>
      )}
      <Box mb={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddSection} sx={{ borderRadius: 2, fontWeight: 600 }}>
          Add Section/Unit
        </Button>
      </Box>
      {sections.length === 0 && (
        <Typography color="textSecondary">No sections/units yet. Add one to get started.</Typography>
      )}
      <Box display="flex" flexDirection="column" gap={3}>
        {sections.map((section) => (
          <Paper key={section.id} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>{section.title}</Typography>
              <IconButton onClick={() => handleEditSection(section)} color="primary"><EditIcon /></IconButton>
              <IconButton onClick={() => handleDeleteSection(section.id)} color="error"><DeleteIcon /></IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>{section.description}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Button variant="outlined" startIcon={<AddIcon />} sx={{ mb: 2, borderRadius: 2 }} onClick={() => handleAddContent(section.id)}>
              Add Content
            </Button>
            <Box display="flex" flexDirection="column" gap={1}>
              {section.contents && section.contents.length > 0 ? (
                section.contents.map((content) => (
                  <Paper key={content.id} elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', border: '1px solid #e3e3e3', borderRadius: 1, mb: 1 }}>
                    <DescriptionIcon sx={{ color: '#1976d2', mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight={500}>{content.title} {content.file && <a href={content.file} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', marginLeft: 8 }}>[File]</a>}</Typography>
                      {content.text_content && <Typography variant="body2" color="text.secondary">{content.text_content}</Typography>}
                    </Box>
                    <IconButton onClick={() => handleEditContent(content, section.id)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteContent(content.id)} color="error"><DeleteIcon /></IconButton>
                  </Paper>
                ))
              ) : (
                <Typography color="textSecondary">No content in this section.</Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
      {/* Section Dialog */}
      <SectionDialog
        open={sectionDialogOpen}
        onClose={handleSectionDialogClose}
        moduleId={moduleId}
        section={editSection}
      />
      {/* Content Dialog */}
      <ContentItemDialog
        open={contentDialogOpen}
        onClose={handleContentDialogClose}
        sectionId={currentSectionId}
        content={editContent}
      />
    </Box>
  );
};

// SectionDialog and ContentItemDialog can be implemented as simple dialogs below or imported from components

const SectionDialog = ({ open, onClose, moduleId, section }) => {
  const [title, setTitle] = useState(section ? section.title : '');
  const [description, setDescription] = useState(section ? section.description : '');
  useEffect(() => {
    setTitle(section ? section.title : '');
    setDescription(section ? section.description : '');
  }, [section]);
  const handleSave = async () => {
    if (section) {
      await instructorApi.updateSection(section.id, { title, description, module: moduleId });
    } else {
      await instructorApi.createSection({ title, description, module: moduleId });
    }
    onClose(true);
  };
  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>{section ? 'Edit Section/Unit' : 'Add Section/Unit'}</DialogTitle>
      <DialogContent>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={3} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const ContentItemDialog = ({ open, onClose, sectionId, content }) => {
  const [title, setTitle] = useState(content ? content.title : '');
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState(content ? content.text_content : '');
  useEffect(() => {
    setTitle(content ? content.title : '');
    setTextContent(content ? content.text_content : '');
    setFile(null);
  }, [content]);
  const handleSave = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('section', sectionId);
    if (file) formData.append('file', file);
    formData.append('text_content', textContent);
    if (content) {
      await instructorApi.updateSectionContent(content.id, formData);
    } else {
      await instructorApi.createSectionContent(formData);
    }
    onClose(true);
  };
  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>{content ? 'Edit Content' : 'Add Content'}</DialogTitle>
      <DialogContent>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Text Content" value={textContent} onChange={e => setTextContent(e.target.value)} fullWidth multiline rows={3} sx={{ mb: 2 }} />
        <input type="file" onChange={e => setFile(e.target.files[0])} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleContent; 