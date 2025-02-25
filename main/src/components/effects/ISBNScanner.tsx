'use client';

import React, { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { QrCode, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface ISBNInputProps {
  isbn: string;
  setIsbn: (isbn: string) => void;
  error?: string;
  searchLoading: boolean;
  fetchBookData: (isbn: number) => void;
}

const ISBNInput = ({ isbn, setIsbn, error, searchLoading, fetchBookData }: ISBNInputProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    // If we're switching away from the scanner tab, stop scanning
    if (newValue !== 1 && scanning) {
      stopScanner();
    }
  };

  const startScanner = () => {
    if (scannerRef.current) {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      const qrCodeSuccessCallback = (decodedText: string) => {
        // Check if the decoded text is a valid ISBN (just numbers, 10 or 13 digits)
        const isbnRegex = /^\d{10,13}$/;
        if (isbnRegex.test(decodedText)) {
          setIsbn(decodedText);
          stopScanner();
          setActiveTab(0); // Switch back to manual input tab

          toast.success(`ISBN detected: ${decodedText}`, {
            position: 'bottom-center',
            autoClose: 3000,
          });

          // Fetch book data if we have a 13-digit ISBN
          if (decodedText.length === 13) {
            fetchBookData(Number(decodedText));
          }
        } else {
          toast.warning('Scanned code does not appear to be a valid ISBN', {
            position: 'bottom-center',
            autoClose: 3000,
          });
        }
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        (error) => console.error("QR Code scanning error:", error)
      ).then(() => {
        setScanning(true);
        toast.info('Camera started. Position the ISBN barcode in view.', {
          position: 'bottom-center',
          autoClose: 3000,
        });
      }).catch((err) => {
        console.error("Error starting scanner:", err);

        // Handle specific error cases
        if (err.name === 'NotAllowedError') {
          toast.error('Camera access denied. Please allow camera access to scan ISBNs.', {
            position: 'bottom-center',
            autoClose: 5000,
          });
        } else if (err.name === 'NotFoundError') {
          toast.error('Camera not found. Please ensure your device has a working camera.', {
            position: 'bottom-center',
            autoClose: 5000,
          });
        } else if (err.name === 'NotReadableError') {
          toast.error('Camera not readable. The camera may be in use by another application.', {
            position: 'bottom-center',
            autoClose: 5000,
          });
        } else if (err.name === 'OverconstrainedError') {
          toast.error('Camera constraints cannot be satisfied. Try using a different device.', {
            position: 'bottom-center',
            autoClose: 5000,
          });
        } else {
          toast.error(`Camera error: ${err.message || 'Unknown error'}`, {
            position: 'bottom-center',
            autoClose: 5000,
          });
        }
      });
    }
  };

  const stopScanner = () => {
    if (scanner && scanning) {
      scanner.stop().then(() => {
        setScanning(false);
        setScanner(null);
        toast.info('Camera stopped', {
          position: 'bottom-center',
          autoClose: 2000,
        });
      }).catch((err) => {
        console.error("Error stopping scanner:", err);
        toast.error(`Error stopping camera: ${err.message || 'Unknown error'}`, {
          position: 'bottom-center',
          autoClose: 3000,
        });
      });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Enter ISBN" />
        <Tab label="Scan Book" />
      </Tabs>

      {activeTab === 0 ? (
        <TextField
          fullWidth
          label="ISBN"
          variant="outlined"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          error={!!error}
          helperText={error}
          InputProps={{
            endAdornment: searchLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setActiveTab(1)}
                  edge="end"
                  aria-label="scan book"
                >
                  <QrCode size={20} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ) : (
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box
            ref={scannerRef}
            id="qr-reader"
            sx={{
              width: '100%',
              height: '300px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {!scanning && (
              <Button
                variant="contained"
                onClick={startScanner}
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#333',
                  }
                }}
              >
                Start Camera
              </Button>
            )}
          </Box>

          {scanning && (
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
              onClick={stopScanner}
            >
              <X size={20} />
            </IconButton>
          )}

          <Box sx={{ mt: 2, textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
            Position the book's ISBN barcode within the camera view
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ISBNInput;
