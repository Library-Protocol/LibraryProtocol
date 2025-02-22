import React, { useState, useRef, useEffect } from 'react';

import { Box, Slider, Select, MenuItem, Typography } from '@mui/material';
import { SketchPicker } from 'react-color';

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

  // Function to generate image data
  const generateImageData = () => {
    if (coverRef.current) {
      // Create a canvas to draw the content
      const canvas = document.createElement('canvas');

      canvas.width = 700;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw background
        if (useGradient) {
          const gradient = ctx.createLinearGradient(0, 0, 700, 1000);

          gradient.addColorStop(0, primaryColor);
          gradient.addColorStop(1, secondaryColor);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = primaryColor;
        }

        ctx.globalAlpha = overlayOpacity / 100;
        ctx.fillRect(0, 0, 700, 1000);

        // Draw uploaded image if present
        if (uploadedImage) {
          const img = new Image();

          img.crossOrigin = 'Anonymous';

          img.onload = () => {
            ctx.globalAlpha = overlayOpacity / 100;
            ctx.drawImage(img, 0, 0, 700, 1000);
            drawText(ctx);
            const imageData = canvas.toDataURL('image/png');

            onImageChange?.(imageData);
          };

          img.src = uploadedImage;
        } else {
          drawText(ctx);
          const imageData = canvas.toDataURL('image/png');

          onImageChange?.(imageData);
        }
      }
    }
  };

  // Helper function to draw text on canvas
  const drawText = (ctx: CanvasRenderingContext2D) => {
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${titleSize}px ${
      coverStyle === 'classic' ? 'serif' : 'sans-serif'
    }`;

    if (coverStyle === 'minimal') {
      ctx.letterSpacing = '0.1em';
    }

    const text = (libraryName || 'My') + ' Library';
    const maxWidth = 560; // 80% of 700px

    wrapText(ctx, text, 350, 500, maxWidth, titleSize * 1.2);
  };

  // Helper function to wrap text
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y + (lineCount * lineHeight));
        line = words[n] + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, y + (lineCount * lineHeight));
  };

  // Update image data when properties change
  useEffect(() => {
    const timer = setTimeout(() => {
      generateImageData();
    }, 300);


return () => clearTimeout(timer);
  }, [
    libraryName,
    primaryColor,
    secondaryColor,
    useGradient,
    overlayOpacity,
    titleSize,
    coverStyle,
    uploadedImage,
  ]);

  // Get dynamic styles for the cover preview
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
    </div>
  );
};

export default CustomizableCover;
