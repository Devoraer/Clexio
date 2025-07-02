import { Box, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const DashboardHeader = () => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
      <Typography variant="h4">דשבורד מעבדה</Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <InfoIcon color="action" />
        <Typography variant="subtitle1">סקירה כללית</Typography>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
