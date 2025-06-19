// 📄 src/pages/SamplesDashboard.tsx

import { Box, Typography } from "@mui/material";

export default function SamplesDashboard() {
  return (
    <Box
      sx={{
        direction: "rtl",
        textAlign: "center",
        mt: 8,
        px: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        ברוך הבא לדף ניהול דגימות
      </Typography>
    </Box>
  );
}
