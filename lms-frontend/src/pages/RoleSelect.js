import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import '../Roleselect.css';
import LogoText from '../components/LogoText';

const RoleSelect = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/login/${selectedRole.toLowerCase()}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: '16px',
          maxWidth: '400px',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        <LogoText />
        <Typography
          variant="subtitle1"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '24px',
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          Choose your role to continue
        </Typography>

        <Select
          value={selectedRole}
          onChange={handleRoleChange}
          displayEmpty
          fullWidth
          sx={{
            marginBottom: 3,
            height: '56px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            borderRadius: '12px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: '2px',
              borderRadius: '12px'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8231D2'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8231D2',
              borderWidth: '2px'
            },
            '& .MuiSelect-icon': {
              color: '#fff'
            },
            '& .MuiSelect-select': {
              padding: '14px'
            }
          }}
        >
          <MenuItem value="" disabled>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Select Role</Typography>
          </MenuItem>
          <MenuItem value="Student">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              py: 1 
            }}>
              <SchoolIcon sx={{ 
                color: '#8231D2',
                fontSize: 28
              }} />
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>Student</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="Instructor">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              py: 1
            }}>
              <PersonIcon sx={{ 
                color: '#8231D2',
                fontSize: 28
              }} />
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>Instructor</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="Funder">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              py: 1
            }}>
              <BusinessIcon sx={{ 
                color: '#8231D2',
                fontSize: 28
              }} />
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>Funder</Typography>
            </Box>
          </MenuItem>
        </Select>

        <Button
          variant="contained"
          fullWidth
          onClick={handleContinue}
          disabled={!selectedRole}
          sx={{
            height: '56px',
            backgroundColor: '#8231D2',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(130, 49, 210, 0.4)',
            '&:hover': {
              backgroundColor: '#6a1fb3',
              boxShadow: '0 6px 16px rgba(130, 255, 210, 0.6)'
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          Continue
        </Button>
      </Paper>
    </Box>
  );
};

export default RoleSelect;
