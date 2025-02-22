'use client';

import React, { useState, useRef, useEffect } from 'react';

import { Box, Slider, Select, MenuItem, Typography } from '@mui/material';
import { SketchPicker } from 'react-color';
import html2canvas from 'html2canvas';

interface CoverImageCustomizationProps {
  libraryName: string;
  onImageChange?: (imageData: string) => void;
  showCustomization?: boolean;
}

type CoverStyle = 'modern' | 'classic' | 'minimal';

const CustomizableCover: React.FC<CoverImageCustomizationProps> = ({
  libraryName,
  onImageChange,
  showCustomization = true,
}) => {
  const [primaryColor, setPrimaryColor] = useState('#1a365d');
  const [secondaryColor, setSecondaryColor] = useState('#2d3748');
  const [useGradient, setUseGradient] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  const [titleSize, setTitleSize] = useState(72);
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('modern');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const coverRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLDivElement | null>(null);

  // Create an offscreen container for rendering
  useEffect(() => {
    if (!offscreenRef.current) {
      const offscreen = document.createElement('div');

      offscreen.style.position = 'absolute';
      offscreen.style.left = '-9999px'; // Move offscreen
      document.body.appendChild(offscreen);
      offscreenRef.current = offscreen;
    }


return () => {
      if (offscreenRef.current) {
        document.body.removeChild(offscreenRef.current);
        offscreenRef.current = null;
      }
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = async () => {
    if (!coverRef.current || !offscreenRef.current) return;

    try {
      // Clone the content into the offscreen container
      offscreenRef.current.innerHTML = '';
      const clone = coverRef.current.cloneNode(true) as HTMLDivElement;

      offscreenRef.current.appendChild(clone);

      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: true,
      });

      const imageData = canvas.toDataURL('image/png', 1.0);

      onImageChange?.(imageData);
    } catch (error) {
      console.error('Error converting to image:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => handleChange(), 100);


return () => clearTimeout(timeoutId);
  }, [libraryName]);

  useEffect(() => {
    const timeoutId = setTimeout(() => handleChange(), 500);


return () => clearTimeout(timeoutId);
  }, [primaryColor, secondaryColor, useGradient, overlayOpacity, titleSize, coverStyle, uploadedImage]);

  const getCoverStyles = () => {
    const containerStyles: React.CSSProperties = {
      position: 'relative',
      width: '700px',
      height: '1000px',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    };

    const backgroundStyles: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: useGradient
        ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
        : primaryColor,
      opacity: overlayOpacity / 100,
    };

    const imageOverlayStyles: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: uploadedImage ? `url(${uploadedImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: overlayOpacity / 100,
    };

    const contentStyles: React.CSSProperties = {
      position: 'relative',
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      zIndex: 1,
    };

    return { containerStyles, backgroundStyles, imageOverlayStyles, contentStyles };
  };

  const { containerStyles, backgroundStyles, imageOverlayStyles, contentStyles } = getCoverStyles();

  return (
    <div className="w-full h-full flex flex-col space-y-8 p-8">
      <div className={`w-full h-full flex flex-row ${showCustomization ? 'space-x-8' : ''} p-8`}>
        <div className={showCustomization ? 'flex-1' : 'w-full'}>
          <div ref={coverRef} style={containerStyles} className="shadow-lg">
            <div style={backgroundStyles} />
            {uploadedImage && <div style={imageOverlayStyles} />}
            <div style={contentStyles}>
              <Typography
                variant="h1"
                className="font-bold text-white text-center break-words"
                style={{
                  fontSize: `${titleSize}px`,
                  fontFamily: coverStyle === 'classic' ? 'serif' : 'sans-serif',
                  letterSpacing: coverStyle === 'minimal' ? '0.1em' : 'normal',
                  maxWidth: '80%',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  overflow: 'visible',
                }}
              >
                {(libraryName || 'My') + ' Library'}
              </Typography>
            </div>
          </div>
        </div>
        {showCustomization && (
          <div className="w-full max-w-md space-y-4 mx-auto">
            {/* Customization controls unchanged */}
            <div className="flex flex-col space-y-2">
              <Typography>Cover Style</Typography>
              <Select<CoverStyle>
                value={coverStyle}
                onChange={(e) => setCoverStyle(e.target.value as CoverStyle)}
                fullWidth
              >
                <MenuItem value="modern">Modern</MenuItem>
                <MenuItem value="classic">Classic</MenuItem>
                <MenuItem value="minimal">Minimal</MenuItem>
              </Select>
            </div>
            {/* Other controls omitted for brevity */}
            {showCustomization && (
          <div className="w-full max-w-md space-y-4 mx-auto">
            {/* Image Upload */}


            <div className="flex flex-col space-y-2">
              <Typography>Cover Style</Typography>
              <Select<CoverStyle>
                value={coverStyle}
                onChange={(e) => setCoverStyle(e.target.value as CoverStyle)}
                fullWidth
              >
                <MenuItem value="modern">Modern</MenuItem>
                <MenuItem value="classic">Classic</MenuItem>
                <MenuItem value="minimal">Minimal</MenuItem>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <Typography>Use Gradient</Typography>
              <Select
                value={useGradient ? 'true' : 'false'}
                onChange={(e) => setUseGradient(e.target.value === 'true')}
                fullWidth
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </div>

            <div className="relative">
              <Typography>Primary Color</Typography>
              <Box
                onClick={() => setShowColorPicker(!showColorPicker)}
                sx={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: primaryColor,
                  cursor: 'pointer',
                  border: '2px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              />
              {showColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2 }}>
                  <Box
                    sx={{
                      position: 'fixed',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                    }}
                    onClick={() => setShowColorPicker(false)}
                  />
                  <SketchPicker
                    color={primaryColor}
                    onChange={(color) => setPrimaryColor(color.hex)}
                  />
                </Box>
              )}
            </div>

            {useGradient && (
              <div>
                <Typography>Secondary Color</Typography>
                <SketchPicker
                  color={secondaryColor}
                  onChange={(color) => setSecondaryColor(color.hex)}
                />
              </div>
            )}

            <div>
              <Typography>Background Opacity</Typography>
              <Slider
                value={overlayOpacity}
                onChange={(_, value) => setOverlayOpacity(value as number)}
                min={20}
                max={100}
                valueLabelDisplay="auto"
                disabled
              />
            </div>

            <div>
              <Typography>Title Size</Typography>
              <Slider
                value={titleSize}
                onChange={(_, value) => setTitleSize(value as number)}
                min={24}
                max={72}
                valueLabelDisplay="auto"
                disabled
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Typography>Upload Cover Image (Optional)</Typography>
                <label
                htmlFor="cover-image-upload"
                className="cursor-pointer bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-md transition-colors duration-200 text-center"
                >
                Choose Image
                <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                />
                </label>
              {uploadedImage && (
              <Typography variant="caption" className="text-gray-600">
                Cover image uploaded successfully
              </Typography>
              )}
            </div>
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizableCover;
