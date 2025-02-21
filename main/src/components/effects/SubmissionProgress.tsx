// components/SubmissionProgress.tsx
import React from 'react';
import { Typography, Box, CircularProgress, Card, CardContent } from '@mui/material';

interface SubmissionProgressProps {
  currentStep: string;
}

const SubmissionProgress: React.FC<SubmissionProgressProps> = ({ currentStep }) => {
  return (
    <Card
      sx={{
        position: 'fixed',
        top: '10px', // Positioned at the top with some margin
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        color: 'black',
        zIndex: 1300,
        width: '300px', // Fixed width for consistency
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px !important', // Override default padding
        }}
      >
        <CircularProgress
          size={24}
          sx={{ marginRight: '12px', color: 'black' }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'medium',
            color: 'black',
          }}
        >
          {currentStep}...
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SubmissionProgress;
