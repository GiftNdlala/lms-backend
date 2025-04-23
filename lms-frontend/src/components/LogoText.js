import React from 'react';
import { Box, Typography } from '@mui/material';
import '../styles/LogoText.css';

const LogoText = ({ variant = 'default' }) => (
  <Box sx={{ textAlign: 'center', mb: variant === 'sidebar' ? 1 : 4 }}>
    <Typography
      variant="h1"
      className="glowing-text"
      sx={{
        fontSize: variant === 'sidebar' ? '2.5rem' : '4rem',
        fontWeight: 900,
        letterSpacing: '0.1em',
        color: '#fff',
        textShadow: `
          0 0 7px #fff,
          0 0 10px #fff,
          0 0 21px #fff,
          0 0 42px #8231D2,
          0 0 82px #8231D2,
          0 0 92px #8231D2
        `,
        mb: 1,
        fontFamily: "'Arial Black', sans-serif",
        animation: 'textGlow 2s infinite alternate'
      }}
    >
      GAS
    </Typography>
    <div className="rainbow-line">
      <div className="glow-effect"></div>
    </div>
    <Typography
      variant="h6"
      sx={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: variant === 'sidebar' ? '0.8rem' : '0.9rem',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.7)'
      }}
    >
      Grace Artisan School
    </Typography>
    <style>
      {`
        @keyframes textGlow {
          0% {
            text-shadow: 
              0 0 7px #fff,
              0 0 10px #fff,
              0 0 21px #fff,
              0 0 42px #8231D2,
              0 0 82px #8231D2,
              0 0 92px #8231D2;
          }
          100% {
            text-shadow: 
              0 0 10px #fff,
              0 0 20px #fff,
              0 0 30px #fff,
              0 0 60px #8231D2,
              0 0 100px #8231D2,
              0 0 120px #8231D2;
          }
        }
      `}
    </style>
  </Box>
);

export default LogoText; 