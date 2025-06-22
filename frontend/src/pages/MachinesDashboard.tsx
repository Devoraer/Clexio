import { Box, Typography } from "@mui/material";

export default function MachinesDashboard() {
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
        דף ניהול ציוד
      </Typography>

      <Typography variant="body1" color="text.secondary">
        כאן תוצג רשימת הציוד במעבדה.
      </Typography>
    </Box>
  );
}
