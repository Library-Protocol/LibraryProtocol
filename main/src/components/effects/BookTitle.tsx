import { useState, useEffect, useRef } from 'react';

import { Typography, Tooltip, IconButton } from '@mui/material';

import { Eye } from 'lucide-react';

function BorrowingTitle({ title }: { title: string }) {
  const [showFullTitle, setShowFullTitle] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowFullTitle(false);
      }
    }

    if (showFullTitle) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFullTitle]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, maxWidth: '200px' }}>
      {/* Truncated title */}
      <Tooltip title={title.length > 20 ? title : ''} arrow>
        <Typography
          variant="subtitle1"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px', // Adjust width as needed
          }}
        >
          {title}
        </Typography>
      </Tooltip>

      {/* Peek Icon */}
      {title.length > 20 && (
        <IconButton size="small" onClick={() => setShowFullTitle(true)}>
          <Eye size={16} />
        </IconButton>
      )}

      {/* Modal for Full Title */}
      {showFullTitle && (
        <div
          ref={modalRef}
          style={{
            position: 'absolute',
            background: 'white',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
            zIndex: 10,
          }}
        >
          <Typography variant="body1">{title}</Typography>
        </div>
      )}
    </div>
  );
}

export default BorrowingTitle;
