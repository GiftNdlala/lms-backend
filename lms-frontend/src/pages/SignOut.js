import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LogoText from '../components/LogoText';

const SignOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate sign out process
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '24px',
            textAlign: 'center'
          }}
        >
          You have been signed out successfully
        </Typography>
        
        <LogoutIcon 
          sx={{ 
            fontSize: 56, 
            color: '#8231D2', 
            mb: 2,
            filter: 'drop-shadow(0 2px 4px rgba(130, 49, 210, 0.4))'
          }} 
        />
        
        <Typography
          variant="h5"
          sx={{
            color: '#fff',
            fontWeight: 700,
            mb: 2,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          Signing Out...
        </Typography>

        <CircularProgress
          size={48}
          thickness={4}
          sx={{
            color: '#8231D2',
            mb: 3,
            filter: 'drop-shadow(0 2px 8px rgba(130, 49, 210, 0.4))'
          }}
        />

        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            opacity: 0.9,
            mb: 3,
            fontSize: '1.1rem',
            fontWeight: 500
          }}
        >
          Thank you for using Grace Artisan School Portal
        </Typography>

        <div className="rainbow-line" />

        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            mt: 3,
            backgroundColor: '#8231D2',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1.1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(130, 49, 210, 0.4)',
            '&:hover': {
              backgroundColor: '#6a1fb3',
              boxShadow: '0 6px 16px rgba(130, 49, 210, 0.6)'
            }
          }}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default SignOut;

