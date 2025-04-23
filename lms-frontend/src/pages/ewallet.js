import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Ewallet = () => {
  const [balance, setBalance] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulated data - Replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBalance(750); // Example balance
      setAchievements([
        {
          id: 1,
          title: 'Quiz Master',
          description: 'Completed Introduction to JavaScript Quiz',
          reward: 150,
          date: '2024-03-15',
          icon: <StarIcon sx={{ color: '#FFD700' }} />
        },
        {
          id: 2,
          title: 'Perfect Score',
          description: 'Achieved 100% in HTML Basics',
          reward: 200,
          date: '2024-03-14',
          icon: <EmojiEventsIcon sx={{ color: '#8231D2' }} />
        },
        {
          id: 3,
          title: 'Quick Learner',
          description: 'Completed CSS Fundamentals in record time',
          reward: 100,
          date: '2024-03-13',
          icon: <TrendingUpIcon sx={{ color: '#4CAF50' }} />
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #8231D2, #4CAF50)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Achievement Wallet
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#8231D2' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #8231D2 0%, #4CAF50 100%)',
                color: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(130, 49, 210, 0.2)'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Current Balance</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  R {balance.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Keep learning to earn more!
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Achievements
              </Typography>
              <List>
                {achievements.map((achievement, index) => (
                  <React.Fragment key={achievement.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(130, 49, 210, 0.05)',
                          transform: 'translateX(8px)'
                        }
                      }}
                    >
                      <ListItemIcon>
                        {achievement.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {achievement.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {achievement.description}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: '#4CAF50', fontWeight: 600, mt: 0.5 }}
                            >
                              +R {achievement.reward.toFixed(2)}
                            </Typography>
                          </>
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {new Date(achievement.date).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Ewallet;
