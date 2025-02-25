'use client';

import React, { useState, useEffect, useCallback } from 'react';

import {
  Card,
  CardContent,
  Button,
  LinearProgress,
  Typography,
  Box,
  IconButton,
  TextField,
  CircularProgress,
  MenuItem,
  ListItemText,
  Snackbar, // Add Snackbar
  Alert,   // Add Alert for better styling
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import Radar from 'radar-sdk-js';
import debounce from 'lodash/debounce';
import { usePrivy } from '@privy-io/react-auth';

import CustomizableCover from '@/components/effects/CoverImageCustomization';
import { registerCurator } from '@/contract/Interraction';
import { sendLibraryCreatedNotificationToReader } from '@/app/server/actions/engage/library-reader';
import { createCuratorMetadata } from '@/utils/pinata';
import SubmissionProgress from '@/components/effects/SubmissionProgress';

interface RadarAutocompleteAddress {
  address: string;
  city: string;
  country: string;
  countryFlag: string;
  countryCode: string;
  formattedAddress: string;
  placeLabel: string;
  postalCode: string;
  state: string;
  stateCode: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface RadarMap {
  setCenter: (center: [number, number]) => void;
}

interface RadarMarker {
  setLngLat: (lngLat: [number, number]) => void;
  getLngLat: () => { lat: number; lng: number };
}

const CreatorOnboarding = () => {
  const [step, setStep] = useState(1);
  const [libraryName, setLibraryName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [locationError, setLocationError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RadarAutocompleteAddress[]>([]);
  const [map, setMap] = useState<RadarMap | null>(null);
  const [marker, setMarker] = useState<RadarMarker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); // Changed to null for cleaner state
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletFetched, setIsWalletFetched] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [curatorPlatformFee] = useState<string>("0.00");
  const [submissionStep, setSubmissionStep] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false); // State for Snackbar visibility
  const { user } = usePrivy();

  useEffect(() => {
    Radar.initialize('prj_live_pk_8412164f073994dfe5cc9afa035e667bdc6370d0');

    const newMap = Radar.ui.map({
      container: 'map',
      style: 'radar-default-v1',
      center: [-73.99110, 40.73430],
      zoom: 11,
    });

    const newMarker = Radar.ui.marker({ color: '#000257' })
      .setLngLat([-73.99110, 40.73430])
      .addTo(newMap);

    setMap(newMap);
    setMarker(newMarker);
  }, []);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        setIsLoading(true);
        setSubmitError(null);

        if (user && user.wallet) {
          setWalletAddress(user.wallet.address);
          setIsWalletFetched(true);
        }
      } catch (err) {
        setSubmitError((err as Error).message || 'Failed to fetch wallet address');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletAddress();
  }, [user]);

  // Show Snackbar when submitError changes
  useEffect(() => {
    if (submitError) {
      setOpenSnackbar(true);
    }
  }, [submitError]);

  const handleSubmit = async () => {
    if (!isWalletFetched) {
      setSubmitError('Please wait while we fetch your wallet address.');
      
return;
    }

    if (!libraryName || !country || !city || !state || !coverImage) {
      setSubmitError('Please fill in all required fields and customize your cover');
      
return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmissionStep('Storing data on IPFS Node');

    try {
      const { metadataCID, imageCID } = await createCuratorMetadata(libraryName, coverImage);

      setSubmissionStep('Magically putting library onchain');
      const registrationData = { name: libraryName };

      const { hash, uniqueId, nftTokenId } = await registerCurator(
        registrationData,
        metadataCID,
        curatorPlatformFee
      );

      setSubmissionStep('Submitting registration');

      const response = await fetch('/api/library/curator/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: walletAddress,
          name: libraryName,
          country,
          city,
          state,
          coverImage: imageCID,
          transactionHash: hash,
          onChainUniqueId: uniqueId,
          nftTokenId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create library');
      }

      await sendLibraryCreatedNotificationToReader(data.curator.name, data.curator.id, walletAddress);

      setSubmissionStep(null);
      setStep(step + 1);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('user rejected transaction')) {
          setSubmitError('Transaction was rejected. Please try again.');
        } else if (error.message.includes('insufficient funds')) {
          setSubmitError('Insufficient funds to complete the transaction.');
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError('Failed to create library. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setSubmissionStep(null);
    }
  };

  const handleSearchLocation = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      
return;
    }

    setIsSearching(true);

    try {
      const result = await Radar.autocomplete({
        query,
        limit: 10,
      });

      if (result.addresses.length > 0) {
        setSearchResults(result.addresses as unknown as RadarAutocompleteAddress[]);
        setLocationError('');
      } else {
        setLocationError('No results found for the entered location.');
        setSearchResults([]);
      }
    } catch (err) {
      setLocationError('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => handleSearchLocation(query), 800),
    []
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;

    setSearchQuery(query);
    debouncedSearch(query);
  };

  const updateMap = (latitude: number, longitude: number) => {
    if (map && marker) {
      map.setCenter([longitude, latitude]);
      marker.setLngLat([longitude, latitude]);
    }
  };

  const handleLocationSelect = (selectedLocation: RadarAutocompleteAddress) => {
    setCountry(selectedLocation.country || '');
    setCity(selectedLocation.city || '');
    setState(selectedLocation.state || '');
    updateMap(selectedLocation.latitude, selectedLocation.longitude);
    setSearchResults([]);
    setSearchQuery(`${selectedLocation.city}, ${selectedLocation.state}, ${selectedLocation.country}`);
  };

  const SuccessStep = () => (
    <>
      <Typography variant="body1" className="text-center mb-6">
        Congratulations! You’ve successfully onboarded as a <strong>Library Owner</strong>. Start adding books to share with the community, or borrow from other library owners!
      </Typography>
    </>
  );

  // Handle Snackbar close
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSubmitError(null); // Clear the error after closing
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: 'white',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <LinearProgress
          variant='determinate'
          value={step === 1 ? 50 : 100}
          sx={{
            height: 4,
            backgroundColor: '#ffffff',
            '.MuiLinearProgress-bar': {
              backgroundColor: '#000000',
            },
          }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1200,
          }}
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft className='w-6 h-6' />
        </IconButton>
      </Box>

      {submissionStep && <SubmissionProgress currentStep={submissionStep} />}

      <div className='min-h-screen flex flex-col lg:flex-row bg-gray-50'>
        <div className='flex-1 flex items-center justify-center p-4 lg:p-8'>
          <div className='w-full max-w-lg'>
            <h1 className='text-3xl font-semibold text-center mb-8 text-gray-800'>
              {step === 1 ? 'Set up your library profile' : 'Success!'}
            </h1>
            <Card>
              <CardContent className='pt-6'>
                {step === 1 ? (
                  <div className='space-y-6'>
                    <TextField
                      fullWidth
                      label='Library Name'
                      value={libraryName}
                      onChange={(e) => setLibraryName(e.target.value)}
                      className='mb-4'
                    />

                    <div className='relative'>
                      <TextField
                        fullWidth
                        label='Add Location For Your Library...'
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        InputProps={{
                          endAdornment: isSearching && (
                            <CircularProgress size={20} color="inherit" />
                          ),
                        }}
                      />

                      {searchResults.length > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '100%',
                            bgcolor: 'background.paper',
                            boxShadow: 3,
                            borderRadius: 1,
                            zIndex: 1000,
                            mt: 1,
                            maxHeight: '200px',
                            overflowY: 'auto',
                          }}
                        >
                          {searchResults.map((result, index) => (
                            <MenuItem
                              key={index}
                              onClick={() => handleLocationSelect(result)}
                              sx={{ py: 1 }}
                            >
                              <ListItemText
                                primary={`${result.city}, ${result.state}, ${result.country}`}
                              />
                            </MenuItem>
                          ))}
                        </Box>
                      )}
                    </div>

                    {locationError && (
                      <Typography variant='body2' color='error' className='mt-2'>
                        {locationError}
                      </Typography>
                    )}

                    <TextField
                      fullWidth
                      label="Country"
                      value={country}
                      InputProps={{ readOnly: true }}
                      className="mb-4"
                    />
                    <TextField
                      fullWidth
                      label="City"
                      value={city}
                      InputProps={{ readOnly: true }}
                      className="mb-4"
                    />
                    <TextField
                      fullWidth
                      label="State"
                      value={state}
                      InputProps={{ readOnly: true }}
                      className="mb-4"
                    />
                    <TextField
                      fullWidth
                      label="Platform Fee"
                      value={curatorPlatformFee}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <Typography variant="body1" sx={{ mr: 1 }}>
                            ETH
                          </Typography>
                        ),
                      }}
                      className="mb-4"
                    />
                    <div className='mt-6'>
                      <Typography variant='h6' className='mb-2'>
                        Map
                      </Typography>
                      <div id="map" style={{ width: '100%', height: '300px' }} />
                    </div>
                  </div>
                ) : (
                  <SuccessStep />
                )}

                <div className='mt-6 space-y-2'>
                  {step === 2 ? (
                    <Button
                      variant='outlined'
                      fullWidth
                      onClick={() => window.location.href = '/'}
                      sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                          backgroundColor: 'black',
                          borderColor: 'white',
                        },
                      }}
                    >
                      Return Home
                    </Button>
                  ) : (
                    <>
                      <div className='flex flex-col space-y-2'>
                        <Button
                          variant='outlined'
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          sx={{
                            backgroundColor: 'black',
                            color: 'white',
                            borderColor: 'white',
                            width: 'auto',
                            alignSelf: 'flex-end',
                            '&:hover': {
                              backgroundColor: 'black',
                              borderColor: 'white',
                            },
                          }}
                        >
                          {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Continue'
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {step === 1 && (
          <div className='flex-1 flex items-center justify-center p-4 lg:p-8 bg-gray-200'>
            <CustomizableCover
              libraryName={libraryName}
              onImageChange={(imageData) => setCoverImage(imageData)}
              showCustomization={true}
            />
          </div>
        )}
      </div>

      {/* Add Snackbar for error display */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={10000} // Closes after 6 seconds
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Position at top-right
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: '100%' }}
        >
          {submitError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreatorOnboarding;
