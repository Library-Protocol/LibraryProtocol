import React, { useState, useRef, useEffect } from 'react';

import { Box, Slider, Select, MenuItem, Typography, Button } from '@mui/material';
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
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null); // 'primary' or 'secondary'
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  const [titleSize] = useState(72);
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('modern');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const coverRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateImageData = () => {
    if (coverRef.current) {
      const canvas = document.createElement('canvas');

      canvas.width = 700;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      if (ctx) {
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

        if (uploadedImage) {
          const img = new Image();

          img.crossOrigin = 'Anonymous';

          img.onload = () => {
            ctx.globalAlpha = overlayOpacity / 100;
            ctx.drawImage(img, 0, 0, 700, 1000);
            drawText(ctx);
            onImageChange?.(canvas.toDataURL('image/png'));
          };

          img.src = uploadedImage;
        } else {
          drawText(ctx);
          onImageChange?.(canvas.toDataURL('image/png'));
        }
      }
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D) => {
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${titleSize}px ${coverStyle === 'classic' ? 'serif' : 'sans-serif'}`;
    if (coverStyle === 'minimal') ctx.letterSpacing = '0.1em';
    const text = (libraryName || 'My') + ' Library';
    const maxWidth = 560;

    wrapText(ctx, text, 350, 500, maxWidth, titleSize * 1.2);
  };

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
        ctx.fillText(line, x, y + lineCount * lineHeight);
        line = words[n] + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, y + lineCount * lineHeight);
  };

  useEffect(() => {
    const timer = setTimeout(generateImageData, 300);

    
return () => clearTimeout(timer);
  }, [libraryName, primaryColor, secondaryColor, useGradient, overlayOpacity, coverStyle, uploadedImage]);

  const getCoverStyles = () => ({
    containerStyles: {
      position: 'relative',
      width: '100%',
      maxWidth: '700px',
      aspectRatio: '7 / 10',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      margin: '0 auto',
    } as React.CSSProperties,
    backgroundStyles: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: useGradient
        ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
        : primaryColor,
      opacity: overlayOpacity / 100,
    } as React.CSSProperties,
    imageOverlayStyles: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: uploadedImage ? `url(${uploadedImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: overlayOpacity / 100,
    } as React.CSSProperties,
    contentStyles: {
      position: 'relative',
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: '1rem', sm: '2rem' },
      zIndex: 1,
    },
  });

  const { containerStyles, backgroundStyles, imageOverlayStyles, contentStyles } = getCoverStyles();

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        p: { xs: 2, sm: 4, md: 8 },
        bgcolor: 'grey.200',
      }}
    >
      {/* Cover Preview */}
      <Box sx={{ flex: showCustomization ? 1 : 'auto', width: '100%', maxWidth: '700px', mx: 'auto' }}>
        <Box ref={coverRef} sx={containerStyles} className="shadow-lg">
          <Box sx={backgroundStyles} />
          {uploadedImage && <Box sx={imageOverlayStyles} />}
          <Box sx={contentStyles}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                fontSize: { xs: '2rem', sm: '3rem', md: `${titleSize}px` },
                fontFamily: coverStyle === 'classic' ? 'serif' : 'sans-serif',
                letterSpacing: coverStyle === 'minimal' ? '0.1em' : 'normal',
                maxWidth: '80%',
                wordWrap: 'break-word',
              }}
            >
              {(libraryName || 'My') + ' Library'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Customization Controls */}
      {showCustomization && (
        <Box sx={{ width: { xs: '100%', md: '400px' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle1">Cover Style</Typography>
            <Select
              value={coverStyle}
              onChange={(e) => setCoverStyle(e.target.value as CoverStyle)}
              fullWidth
              size="small"
            >
              <MenuItem value="modern">Modern</MenuItem>
              <MenuItem value="classic">Classic</MenuItem>
              <MenuItem value="minimal">Minimal</MenuItem>
            </Select>
          </Box>

          <Box>
            <Typography variant="subtitle1">Use Gradient</Typography>
            <Select
              value={useGradient ? 'true' : 'false'}
              onChange={(e) => setUseGradient(e.target.value === 'true')}
              fullWidth
              size="small"
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <Typography variant="subtitle1">Primary Color</Typography>
            <Box
              onClick={() => setShowColorPicker(showColorPicker === 'primary' ? null : 'primary')}
              sx={{
                width: '100%',
                height: '40px',
                bgcolor: primaryColor,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
              }}
            />
            {showColorPicker === 'primary' && (
              <Box sx={{ position: 'absolute', zIndex: 10, mt: 1 }}>
                <Box
                  sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                  onClick={() => setShowColorPicker(null)}
                />
                <SketchPicker color={primaryColor} onChange={(color) => setPrimaryColor(color.hex)} />
              </Box>
            )}
          </Box>

          {useGradient && (
            <Box sx={{ position: 'relative' }}>
              <Typography variant="subtitle1">Secondary Color</Typography>
              <Box
                onClick={() => setShowColorPicker(showColorPicker === 'secondary' ? null : 'secondary')}
                sx={{
                  width: '100%',
                  height: '40px',
                  bgcolor: secondaryColor,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                }}
              />
              {showColorPicker === 'secondary' && (
                <Box sx={{ position: 'absolute', zIndex: 10, mt: 1 }}>
                  <Box
                    sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                    onClick={() => setShowColorPicker(null)}
                  />
                  <SketchPicker color={secondaryColor} onChange={(color) => setSecondaryColor(color.hex)} />
                </Box>
              )}
            </Box>
          )}

          <Box>
            <Typography variant="subtitle1">Background Opacity</Typography>
            <Slider
              value={overlayOpacity}
              onChange={(_, value) => setOverlayOpacity(value as number)}
              min={20}
              max={100}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="subtitle1">Upload Cover Image (Optional)</Typography>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ bgcolor: 'black', color: 'white', '&:hover': { bgcolor: 'grey.900' }, py: 1.5 }}
            >
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </Button>
            {uploadedImage && (
              <Typography variant="caption" sx={{ color: 'grey.600', mt: 1 }}>
                Cover image uploaded successfully
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CustomizableCover;
