import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { Camera, X, RefreshCw } from 'lucide-react';
import { IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const DICEBEAR_STYLES = [
  'adventurer',
  'avataaars',
  'bottts',
  'funEmoji',
  'lorelei',
  'notionists',
  'openPeeps',
  'personas',
  'pixelArt'
];

interface AvatarSelectorProps {
  onAvatarChange: (avatar: string) => void;
  uniqueId: string;
  initialImage?: string;
}

const AvatarSelector = ({ onAvatarChange, uniqueId, initialImage }: AvatarSelectorProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState(initialImage || '');
  const [showOptions, setShowOptions] = useState(false);
  const [validAvatars, setValidAvatars] = useState<{ url: string; style: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (initialImage && initialImage !== selectedAvatar) {
      setSelectedAvatar(initialImage);
    }
  }, [initialImage]);

  useEffect(() => {
    if (selectedAvatar) {
      onAvatarChange(selectedAvatar);
    }
  }, [selectedAvatar, onAvatarChange]);

  const generateSeed = useCallback((style: string) => {
    const combinedString = `${uniqueId}-${style}-${refreshKey}`;
    let hash = 0;

    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);

      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(36);
  }, [uniqueId, refreshKey]);

  const avatarOptions = useMemo(() => {
    if (!uniqueId) return [];
    
return DICEBEAR_STYLES.map(style => ({
      url: `https://api.dicebear.com/9.x/${style}/svg?seed=${generateSeed(style)}`,
      style
    }));
  }, [uniqueId, generateSeed]);

  const validateAvatars = useCallback(() => {
    setIsLoading(true);
    const filteredAvatars: { url: string; style: string }[] = [];
    let loadedCount = 0;

    avatarOptions.forEach(avatar => {
      const img = new Image();

      img.src = avatar.url;

      img.onload = () => {
        filteredAvatars.push(avatar);
        loadedCount++;

        if (loadedCount === avatarOptions.length) {
          setValidAvatars(filteredAvatars);
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        loadedCount++;

        if (loadedCount === avatarOptions.length) {
          setValidAvatars(filteredAvatars);
          setIsLoading(false);
        }
      };
    });
  }, [avatarOptions]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      
return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatar(reader.result);
        setShowOptions(false);
      }
    };

    reader.readAsDataURL(file);
  }, []);

  const handleAvatarSelect = useCallback((avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setShowOptions(false);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    validateAvatars();
  }, [validateAvatars]);

  const toggleOptions = useCallback(() => {
    setShowOptions(prev => !prev);

    if (!showOptions) {
      validateAvatars();
    }
  }, [showOptions, validateAvatars]);

  const handleReset = useCallback(() => {
    setSelectedAvatar('');
    onAvatarChange('');
  }, [onAvatarChange]);

  return (
    <div className="relative">
      <div
        className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        onClick={toggleOptions}
      >
        {selectedAvatar ? (
          <div className="relative w-full h-full group">
            <img
              src={selectedAvatar}
              alt="Profile avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <Camera className="w-8 h-8 text-gray-600" />
        )}
      </div>

      {selectedAvatar && (
        <IconButton
          className="absolute -top-2 -right-2 bg-white hover:bg-gray-100 shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
        >
          <X className="w-4 h-4 text-gray-600" />
        </IconButton>
      )}

      <IconButton
        className="absolute bottom-0 right-0 bg-white hover:bg-gray-100"
        onClick={toggleOptions}
      >
        <Camera className="w-4 h-4 text-gray-600" />
      </IconButton>

      {showOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <IconButton
              onClick={() => setShowOptions(false)}
              className="absolute top-2 right-2"
            >
              <X className="w-5 h-5" />
            </IconButton>

            <h3 className="text-lg font-semibold mb-4 text-center">
              Choose your avatar
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
                </div>
              )}

              <AnimatePresence>
                {validAvatars.map((avatar, index) => (
                  <motion.div
                    key={`${avatar.style}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="aspect-square rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-orange-600 transition-all"
                    onClick={() => handleAvatarSelect(avatar.url)}
                  >
                    <img
                      src={avatar.url}
                      alt={`Avatar style ${avatar.style}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <label className="cursor-pointer inline-flex items-center gap-2 hover:text-orange-600 transition-colors">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <span className="text-sm">Upload custom image</span>
              </label>

              <IconButton
                onClick={handleRefresh}
                className="hover:text-orange-600"
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </IconButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;
