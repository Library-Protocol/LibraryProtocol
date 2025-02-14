import React from "react";

import { Box, Typography } from "@mui/material";

interface FallbackBookCoverProps {
  title: string;
  author: string;
  width?: string | number;
  height?: string | number;
  titleFontSize?: string | number;
  authorFontSize?: string | number;
}

const FallbackBookCover: React.FC<FallbackBookCoverProps> = ({
  title,
  author,
  width = "300px",
  height = "400px",
  titleFontSize = "1rem", // Default title font size
  authorFontSize = "0.875rem", // Default author font size
}) => {
  return (
    <Box
      sx={{
        width,
        height,
        backgroundColor: "#D3D3D3", // Light gray background
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px",
        border: "2px solid white", // White border
        textAlign: "center",
        p: 2,
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "90%",
          height: "90%",
          border: "2px solid white", // Inner white frame
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#333",
            mb: 1,
            maxWidth: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            fontSize: titleFontSize,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          fontStyle="italic"
          sx={{
            maxWidth: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            fontSize: authorFontSize,
          }}
        >
          {author}
        </Typography>
      </Box>
    </Box>
  );
};

export default FallbackBookCover;
