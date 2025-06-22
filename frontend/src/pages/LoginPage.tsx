import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import ScienceIcon from '@mui/icons-material/Science'; 

export default function LoginPage() {
  return (
    <Box 
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        direction: "rtl",  // יישור לימין
        textAlign: "center", // כל הטקסט מיושר למרכז
        mt: 8 // מרווח עליון – Margin Top
      }}
    >
      <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
        <ScienceIcon />
      </Avatar>

      <Typography variant="h4" mt={2}>
        Smart Lab
      </Typography>

      <Typography variant="subtitle1" color="text.secondary">
        התחבר למערכת ניהול המעבדה
      </Typography>
    </Box>
  );
}
