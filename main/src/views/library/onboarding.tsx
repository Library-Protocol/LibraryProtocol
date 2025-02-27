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
  Snackbar,
  Alert,
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
  const [,setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RadarAutocompleteAddress[]>([]);
  const [map, setMap] = useState<RadarMap | null>(null);
  const [marker, setMarker] = useState<RadarMarker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletFetched, setIsWalletFetched] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [curatorPlatformFee] = useState<string>("0.00");
  const [submissionStep, setSubmissionStep] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
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
      setIsLoading(true);
      setSubmitError(null);

      try {
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

  useEffect(() => {
    if (submitError) setOpenSnackbar(true);
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
        headers: { 'Content-Type': 'application/json' },
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

      if (!response.ok) throw new Error(data.error || 'Failed to create library');
      await sendLibraryCreatedNotificationToReader(data.curator.name, data.curator.id, walletAddress);
      setSubmissionStep(null);
      setStep(step + 1);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message.includes('user rejected transaction')
            ? 'Transaction was rejected. Please try again.'
            : error.message.includes('insufficient funds')
            ? 'Insufficient funds to complete the transaction.'
            : error.message
          : 'Failed to create library. Please try again.'
      );
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
      const result = await Radar.autocomplete({ query, limit: 10 });

      setSearchResults(result.addresses.length > 0
        ? result.addresses as unknown as RadarAutocompleteAddress[]
        : []);
      setLocationError(result.addresses.length > 0 ? '' : 'No results found for the entered location.');
    } catch (err) {
      setLocationError('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearchLocation, 800), []);

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
    <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
      Congratulations! You’ve successfully onboarded as a <strong>Library Owner</strong>. Start adding books to share with the community, or borrow from other library owners!
    </Typography>
  );

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSubmitError(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
      {/* Header with Progress Bar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: 'white', boxShadow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 1 ? 50 : 100}
          sx={{ height: 4, bgcolor: 'white', '& .MuiLinearProgress-bar': { bgcolor: 'black' } }}
        />
        <IconButton
          onClick={() => window.location.href = '/'}
          sx={{ position: 'absolute', top: 8, left: 8 }}
        >
          <ArrowLeft size={24} />
        </IconButton>
      </Box>

      {submissionStep && <SubmissionProgress currentStep={submissionStep} />}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, p: { xs: 2, sm: 4, lg: 8 } }}>
        {/* Form Section */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: { xs: 4, lg: 0 } }}>
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 480 } }}>
            <Typography variant="h4" sx={{ fontWeight: 600, textAlign: 'center', mb: 4, color: 'grey.800' }}>
              {step === 1 ? 'Set Up Your Library Profile' : 'Success!'}
            </Typography>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent sx={{ pt: 4, px: { xs: 2, sm: 4 } }}>
                {step === 1 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Library Name"
                      value={libraryName}
                      onChange={(e) => setLibraryName(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        fullWidth
                        label="Add Location For Your Library..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          endAdornment: isSearching && <CircularProgress size={20} />,
                        }}
                      />
                      {searchResults.length > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '100%',
                            bgcolor: 'white',
                            boxShadow: 3,
                            borderRadius: 1,
                            mt: 1,
                            maxHeight: 200,
                            overflowY: 'auto',
                            zIndex: 1000,
                          }}
                        >
                          {searchResults.map((result, index) => (
                            <MenuItem
                              key={index}
                              onClick={() => handleLocationSelect(result)}
                              sx={{ py: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                            >
                              <ListItemText primary={`${result.city}, ${result.state}, ${result.country}`} />
                            </MenuItem>
                          ))}
                        </Box>
                      )}
                    </Box>
                    {locationError && (
                      <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                        {locationError}
                      </Typography>
                    )}
                    <TextField fullWidth label="Country" value={country} InputProps={{ readOnly: true }} variant="outlined" size="small" />
                    <TextField fullWidth label="City" value={city} InputProps={{ readOnly: true }} variant="outlined" size="small" />
                    <TextField fullWidth label="State" value={state} InputProps={{ readOnly: true }} variant="outlined" size="small" />
                    <TextField
                      fullWidth
                      label="Platform Fee"
                      value={curatorPlatformFee}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <Typography sx={{ mr: 1 }}>ETH</Typography>,
                      }}
                      variant="outlined"
                      size="small"
                    />
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>Map</Typography>
                      <Box id="map" sx={{ width: '100%', height: { xs: 200, sm: 300 }, borderRadius: 1, overflow: 'hidden' }} />
                    </Box>
                  </Box>
                ) : (
                  <SuccessStep />
                )}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  {step === 2 ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => window.location.href = '/'}
                      sx={{
                        bgcolor: 'black',
                        color: 'white',
                        '&:hover': { bgcolor: 'grey.900' },
                        py: 1.5,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      Return Home
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      sx={{
                        bgcolor: 'black',
                        color: 'white',
                        '&:hover': { bgcolor: 'grey.900' },
                        py: 1.5,
                        px: 4,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Cover Image Section (Hidden on Mobile when Step 1) */}
        {step === 1 && (
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', lg: 'flex' },
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'grey.200',
              p: 4,
            }}
          >
            <CustomizableCover
              libraryName={libraryName}
              onImageChange={(imageData) => setCoverImage(imageData)}
              showCustomization={true}
            />
          </Box>
        )}
      </Box>

      {/* Mobile Cover Image Section */}
      {step === 1 && (
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'center', p: 2, bgcolor: 'grey.200' }}>
          <CustomizableCover
            libraryName={libraryName}
            onImageChange={(imageData) => setCoverImage(imageData)}
            showCustomization={true}
          />
        </Box>
      )}

      {/* Snackbar for Errors */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={10000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {submitError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatorOnboarding;
