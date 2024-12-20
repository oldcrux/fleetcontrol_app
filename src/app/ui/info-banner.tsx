import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from '@mui/icons-material/Info';

interface BannerProps {
  onClose: () => void;
}

const Banner: React.FC<BannerProps> = () => {
  return (
    <Box
    sx={{
      width: "100%",
      bgcolor: "orange",
      color: "#474545",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: { xs: 2, sm: 3, md: 5 },
      py: { xs: 1, sm: 2 },
      position: "fixed",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1200,
      fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
    }}
    >
      <InfoIcon/>
      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: "0.875rem", sm: "1rem", md: "1rem" }, // Same responsive font size
        }}
      >
        {`Password based login is being retired and will not be available after 31st December 2024.  
        Please reach out to your admin for continued access.`}
      </Typography>
      {/* <IconButton
        size="small"
        sx={{
          color: "white",
          ml: { xs: 1, sm: 2 }, // Adjust margin for spacing near the close button
        }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton> */}
    </Box>
  );
};

export default Banner;
