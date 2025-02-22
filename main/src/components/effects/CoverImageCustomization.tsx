import React, { useState, useRef, useEffect } from 'react';

import { Box, Slider, Select, MenuItem, Typography } from '@mui/material';
import { SketchPicker } from 'react-color';
import html2canvas from 'html2canvas';

import useDebounce from '@/utils/useDebounce';

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
  // State for cover customization
  const [primaryColor, setPrimaryColor] = useState('#1a365d');
  const [secondaryColor, setSecondaryColor] = useState('#2d3748');
  const [useGradient, setUseGradient] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [titleSize, setTitleSize] = useState(72);
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('modern');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Debounced values for performance
  const debouncedPrimaryColor = useDebounce(primaryColor, 300);
  const debouncedSecondaryColor = useDebounce(secondaryColor, 300);
  const debouncedUseGradient = useDebounce(useGradient, 300);
  const debouncedOverlayOpacity = useDebounce(overlayOpacity, 300);
  const debouncedTitleSize = useDebounce(titleSize, 300);
  const debouncedCoverStyle = useDebounce(coverStyle, 300);
  const debouncedUploadedImage = useDebounce(uploadedImage, 300);

  const coverRef = useRef<HTMLDivElement>(null);

  // Function to handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  // Function to generate image
  const generateImage = async () => {
    if (coverRef.current) {
      try {
        const canvas = await html2canvas(coverRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 700,
          windowHeight: 1000,
        });

        const imageData = canvas.toDataURL('image/png', 1.0);

        onImageChange?.(imageData);
      } catch (error) {
        console.error('Error generating canvas:', error);
      }
    }
  };

  // Initial render and library name change
  useEffect(() => {
    const timer = setTimeout(() => {
      generateImage();
    }, 100);


return () => clearTimeout(timer);
  }, [libraryName]);

  // Handle changes with debounced values
  useEffect(() => {
    generateImage();
  }, [
    debouncedPrimaryColor,
    debouncedSecondaryColor,
    debouncedUseGradient,
    debouncedOverlayOpacity,
    debouncedTitleSize,
    debouncedCoverStyle,
    debouncedUploadedImage,
  ]);

  // Get dynamic styles for the cover
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
        {/* Cover Preview */}
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
                }}
              >
                {(libraryName || 'My') + ' Library'}
              </Typography>
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        {showCustomization && (
          <div className="w-full max-w-md space-y-4 mx-auto">
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
    </div>
  );
};

export default CustomizableCover;
