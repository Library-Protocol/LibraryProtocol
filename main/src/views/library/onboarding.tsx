'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Button, LinearProgress, Typography, Box, IconButton, TextField, CircularProgress, MenuItem, ListItemText } from '@mui/material';
import { ArrowLeft, Camera } from 'lucide-react';
import Radar from 'radar-sdk-js';
import debounce from 'lodash/debounce';
import CustomizableCover from '@/components/effects/CoverImageCustomization';

// Define interfaces
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

interface RadarLocation {
  country?: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
}

interface RadarMap {
  setCenter: (center: [number, number]) => void;
}

interface RadarMarker {
  setLngLat: (lngLat: [number, number]) => void;
}

const CreatorOnboarding = () => {
  const [step, setStep] = useState(1);
  const [libraryName, setLibraryName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [locationError, setLocationError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RadarAutocompleteAddress[]>([]);
  const [map, setMap] = useState<RadarMap | null>(null);
  const [marker, setMarker] = useState<RadarMarker | null>(null);

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

      console.log(result);

      if (result.addresses.length > 0) {
        setSearchResults(result.addresses as unknown as RadarAutocompleteAddress[]);
        setLocationError('');
      } else {
        setLocationError('No results found for the entered location.');
        setSearchResults([]);
      }
    } catch (err) {
      setLocationError('Failed to search location. Please try again.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => handleSearchLocation(query), 500),
    []
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const fetchCurrentLocation = async () => {
    setIsLoading(true);
    try {
      // Get the user's geolocation from the browser
      const position: GeolocationPosition = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      // If geolocation data is available
      const { latitude, longitude } = position.coords;

      // Assuming Radar.getLocation() returns a reverse geocoded address
      const result: RadarLocation = await Radar.getLocation();
      console.log(result);

      if (result) {
        // Update the UI with the fetched address and location
        setCountry(result.country || '');
        setCity(result.city || '');
        setState(result.state || '');
        setLocationError('');

        // Update the map with the fetched location's latitude and longitude
        updateMap(latitude, longitude);
      }
    } catch (err) {
      setLocationError('Failed to fetch location. Please enable location services.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
    setSearchResults([]); // Clear results after selection
    setSearchQuery(`${selectedLocation.city}, ${selectedLocation.state}, ${selectedLocation.country}`);
  };

  const SuccessStep = () => (
    <>
      <Typography variant='body1' className='text-center mb-6'>
        All set! Head over to{' '}
        <a href='/creator/home' className='text-blue-500'>
          Creators Dashboard
        </a>{' '}
        .
      </Typography>
      <Typography variant='body1' className='text-center mb-6'>
        Let&apos;s do this!
      </Typography>
    </>
  );

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
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <LinearProgress
          variant='determinate'
          value={step === 1 ? 50 : 100}
          sx={{
            height: 4,
            backgroundColor: '#ffffff',
            '.MuiLinearProgress-bar': {
              backgroundColor: '#000000'
            }
          }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1200
          }}
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft className='w-6 h-6' />
        </IconButton>
      </Box>

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
                    <div className='flex justify-center mb-6'>
                      <div className='relative'>
                        <div className='w-24 h-24 rounded-full bg-black flex items-center justify-center'>
                          <Camera className='w-8 h-8 text-white' />
                        </div>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              backgroundColor: '#f8fafc'
                            }
                          }}
                        >
                          <Camera className='w-4 h-4' />
                        </IconButton>
                      </div>
                    </div>

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
                        label='Search Location'
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
                            overflowY: 'auto'
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

                    <Button
                      variant='outlined'
                      fullWidth
                      onClick={fetchCurrentLocation}
                      sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                          backgroundColor: 'black',
                          borderColor: 'white'
                        }
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Fetch Library Location'}
                    </Button>

                    {locationError && (
                      <Typography variant='body2' color='error' className='mt-2'>
                        {locationError}
                      </Typography>
                    )}

                    <TextField
                      fullWidth
                      label='Country'
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className='mb-4'
                    />
                    <TextField
                      fullWidth
                      label='City'
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className='mb-4'
                    />
                    <TextField
                      fullWidth
                      label='State'
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className='mb-4'
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
                      onClick={() => window.location.href = '/creator/home'}
                      sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                          backgroundColor: 'black',
                          borderColor: 'white'
                        }
                      }}
                    >
                      Let&apos;s do this
                    </Button>
                  ) : (
                    <>
                      <div className='flex justify-end'>
                        <Button
                          variant='outlined'
                          onClick={() => setStep(step + 1)}
                          sx={{
                            backgroundColor: 'black',
                            color: 'white',
                            borderColor: 'white',
                            width: 'auto',
                            '&:hover': {
                              backgroundColor: 'black',
                              borderColor: 'white'
                            }
                          }}
                        >
                          Continue
                        </Button>
                      </div>

                      {step !== 1 && (
                        <Button
                          variant='text'
                          fullWidth
                          sx={{
                            color: '#6B7280'
                          }}
                          onClick={() => setStep(step + 1)}
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

        <div className='flex-1 flex items-center justify-center p-4 lg:p-8 bg-gray-200'>
          <CustomizableCover libraryName={libraryName} />
        </div>
      </div>
    </>
  );
};

export default CreatorOnboarding;
