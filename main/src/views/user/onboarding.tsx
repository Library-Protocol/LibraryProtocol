'use client'

import React, { useState } from 'react';

import Link from 'next/link';

import {
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  TextField,
  IconButton,
  InputLabel,
  FormControl,
  Chip,
  LinearProgress,
  Typography,
  Box,
} from '@mui/material';

import { Camera, Plus, ArrowLeft } from 'lucide-react';

const interests = [
  "Fiction books",
  "Non-fiction books",
  "Classic literature",
  "Poetry collections",
  "Fantasy novels",
  "Mystery and thrillers",
  "Science fiction",
  "Historical fiction",
  "Biography and memoirs",
  "Self-help books",
  "Children's literature",
  "Young adult novels",
  "Graphic novels",
  "Book clubs",
  "Rare and antique books",
  "Book fairs and festivals",
  "Library science and organization",
  "E-books and digital libraries",
  "Audiobooks",
  "Bestsellers and new releases",
  "Writing and publishing",
  "Libraries as community spaces",
  "Literary criticism and analysis",
  "Bookbinding and preservation",
  "Independent bookstores"
];


const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showAllInterests, setShowAllInterests] = useState(false);

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleShowAllInterests = () => {
    setShowAllInterests(true);
  };

  const handleBackToHome = () => {
    // Redirect to the home page
    window.location.href = '/'; // Redirect to the root path
  };

  const handleLetsDoThis = () => {
    // Redirect to another page (e.g., donate.substuck.com)
    window.location.href = '/creator/home';
  };

  const handleContinue = () => {
    console.log('Current step:', step); // Debugging: Log the current step

    if (step < 4) {
      setStep(step + 1); // Increment step if not on the last step
    }
  };

  const ProfileStep = () => (
    <>
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#2B1810] flex items-center justify-center">
            <Camera className="w-8 h-8 text-[#F8F2EB]" />
          </div>
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#1C0F0A',
              border: '1px solid #2B1810',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: '#2B1810',
              },
            }}
          >
            <Camera className="w-4 h-4 text-[#F8F2EB]" />
          </IconButton>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <TextField
            fullWidth
            label="Name (Required)"
            variant="outlined"
            placeholder="Type your name..."
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1C0F0A',
                color: '#F8F2EB',
                '& fieldset': {
                  borderColor: '#2B1810',
                },
                '&:hover fieldset': {
                  borderColor: '#F8F2EB',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#F8F2EB',
              },
            }}
          />
        </div>

        <div>
          <TextField
            fullWidth
            label="Bio"
            variant="outlined"
            placeholder="Say something about yourself..."
            multiline
            rows={4}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1C0F0A',
                color: '#F8F2EB',
                '& fieldset': {
                  borderColor: '#2B1810',
                },
                '&:hover fieldset': {
                  borderColor: '#F8F2EB',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#F8F2EB',
              },
            }}
          />
        </div>

        <div>
  <InputLabel className="mb-2 text-sm text-[#F8F2EB]">
    Where else can you be found? (optional)
  </InputLabel>
  <div className="flex gap-2">
    {/* First Form Field */}
    <FormControl size="small" className="w-[140px]">
      <Select
        defaultValue="instagram"
        sx={{
          backgroundColor: '#1C0F0A',
          color: '#F8F2EB',
        }}
      >
        <MenuItem value="instagram">Instagram</MenuItem>
        <MenuItem value="twitter">Twitter</MenuItem>
        <MenuItem value="linkedin">LinkedIn</MenuItem>
        <MenuItem value="facebook">Facebook</MenuItem>
        <MenuItem value="tiktok">TikTok</MenuItem>
      </Select>
    </FormControl>
    <TextField
      placeholder="@yourhandle"
      size="small"
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#1C0F0A',
          color: '#F8F2EB',
          '& fieldset': {
            borderColor: '#2B1810',
          },
          '&:hover fieldset': {
            borderColor: '#F8F2EB',
          },
        },
      }}
    />
  </div>

  {/* Second Form Field */}
  <div className="flex gap-2 mt-4">
    <FormControl size="small" className="w-[140px]">
      <Select
        defaultValue="twitter"
        sx={{
          backgroundColor: '#1C0F0A',
          color: '#F8F2EB',
        }}
      >
        <MenuItem value="instagram">Instagram</MenuItem>
        <MenuItem value="twitter">Twitter</MenuItem>
        <MenuItem value="linkedin">LinkedIn</MenuItem>
        <MenuItem value="facebook">Facebook</MenuItem>
        <MenuItem value="tiktok">TikTok</MenuItem>
      </Select>
    </FormControl>
    <TextField
      placeholder="@yourhandle"
      size="small"
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#1C0F0A',
          color: '#F8F2EB',
          '& fieldset': {
            borderColor: '#2B1810',
          },
          '&:hover fieldset': {
            borderColor: '#F8F2EB',
          },
        },
      }}
    />
  </div>

  {/* Third Form Field */}
  <div className="flex gap-2 mt-4">
    <FormControl size="small" className="w-[140px]">
      <Select
        defaultValue="linkedin"
        sx={{
          backgroundColor: '#1C0F0A',
          color: '#F8F2EB',
        }}
      >
        <MenuItem value="instagram">Instagram</MenuItem>
        <MenuItem value="twitter">Twitter</MenuItem>
        <MenuItem value="linkedin">LinkedIn</MenuItem>
        <MenuItem value="facebook">Facebook</MenuItem>
        <MenuItem value="tiktok">TikTok</MenuItem>
      </Select>
    </FormControl>
    <TextField
      placeholder="@yourhandle"
      size="small"
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#1C0F0A',
          color: '#F8F2EB',
          '& fieldset': {
            borderColor: '#2B1810',
          },
          '&:hover fieldset': {
            borderColor: '#F8F2EB',
          },
        },
      }}
    />
  </div>
</div>
      </div>
    </>
  );

  const InterestsStep = () => {
    const displayedInterests = showAllInterests ? interests : interests.slice(0, 20);

    return (
      <>
        <Typography variant="body2" className="text-center mb-6 text-[#F8F2EB]">
          We will recommend great books and curators based on the interest on you select
        </Typography>
        <div className="flex flex-wrap gap-2 mb-6">
          {displayedInterests.map((interest) => (
            <Chip
              key={interest}
              label={interest}
              onClick={() => handleInterestToggle(interest)}
              color={selectedInterests.includes(interest) ? 'primary' : 'default'}
              sx={{
                borderRadius: '16px',
                backgroundColor: selectedInterests.includes(interest) ? '#AE5B05' : '#000000',
                color: '#F8F2EB',
                border: '1px solid #AE5B05',
                '&:hover': {
                  backgroundColor: '#2B1810',
                },
              }}
            />
          ))}
          {!showAllInterests && interests.length > 20 && (
            <Chip
              icon={<Plus size={16} className="text-[#F8F2EB]" />}
              label=""
              variant="outlined"
              onClick={handleShowAllInterests}
              sx={{
                width: '32px',
                borderRadius: '16px',
                backgroundColor: '#1C0F0A',
                color: '#F8F2EB',
                border: '1px solid #2B1810',
                '&:hover': {
                  backgroundColor: '#2B1810',
                },
              }}
            />
          )}
        </div>
      </>
    );
  };

  const SuccessStep = () => (
    <>
      <Typography variant="body1" className="text-center mb-6 text-[#F8F2EB]">
        All set! Head over to{' '}
        <Link href="/creator/home" passHref>
          <a className="text-[#2B1810] hover:text-[#F8F2EB]">
            Creators Dashboard
          </a>
        </Link>
        .
      </Typography>
      <Typography variant="body1" className="text-center mb-6 text-[#F8F2EB]">
        Let&apos;s do this!
      </Typography>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C0F0A] to-[#2B1810] text-[#F8F2EB] flex items-center justify-center">
      <div className="w-full max-w-4xl p-4">
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            backgroundColor: '#1C0F0A',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          <LinearProgress
            variant="determinate"
            value={step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 100 : 100}
            sx={{
              height: 4,
              backgroundColor: '#2B1810',
              '.MuiLinearProgress-bar': {
                backgroundColor: '#F8F2EB',
              },
            }}
          />
          {/* Back Button (Arrow) */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1200,
              color: '#F8F2EB',
            }}
            onClick={handleBackToHome}
          >
            <ArrowLeft className="w-6 h-6" />
          </IconButton>
        </Box>

        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mt-16">
            <h1 className="text-3xl font-semibold text-center mb-8 text-[#F8F2EB]">
              {step === 1
                ? 'Set up your profile'
                : step === 2
                ? 'Dive into your interests'
                : 'Success!'}
            </h1>
            <Card
              sx={{
                backgroundColor: '#1C0F0A',
                color: '#F8F2EB',
                border: '1px solid #2B1810',
              }}
            >
              <CardContent className="pt-6">
                {step === 1 ? (
                  <ProfileStep />
                ) : step === 2 ? (
                  <InterestsStep />
                ) : (
                  <SuccessStep />
                )}

                {/* Buttons for All Steps */}
                <div className="mt-6 space-y-2">
                  {step === 3 ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleLetsDoThis}
                      sx={{
                        backgroundColor: '#2B1810',
                        color: '#F8F2EB',
                        '&:hover': {
                          backgroundColor: '#1C0F0A',
                        },
                      }}
                    >
                      Let&apos;s do this
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleContinue}
                        sx={{
                          backgroundColor: '#2B1810',
                          color: '#F8F2EB',
                          '&:hover': {
                            backgroundColor: '#1C0F0A',
                          },
                        }}
                      >
                        Continue
                      </Button>

                      {step !== 1 && (
                        <Button
                          variant="text"
                          fullWidth
                          sx={{ color: '#F8F2EB' }}
                          onClick={handleContinue}
                        >
                          Skip for now
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
