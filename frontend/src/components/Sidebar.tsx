// 📄 src/components/Sidebar.tsx

import { List, ListItemButton, ListItemIcon, ListItemText, Typography, Box } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: 250,
        bgcolor: "primary.main",
        color: "white",
        padding: 2,
        height: "100vh",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Smart Lab
      </Typography>
      <List>
        <ListItemButton onClick={() => navigate("/data")}>
          <ListItemIcon>
            <SendIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Data Anayles" />
        </ListItemButton>
        <ListItemButton onClick={() => alert("לוח שנה יתווסף בהמשך 😊")}>
          <ListItemIcon>
            <CalendarMonthIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Schedule" />
        </ListItemButton>
      </List>
    </Box>
  );
}
