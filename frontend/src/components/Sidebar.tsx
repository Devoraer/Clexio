// 📁 components/Sidebar.tsx

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ScienceIcon from "@mui/icons-material/Science";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // כדי לדעת מה הנתיב הפעיל עכשיו

  const navItems = [
    { label: "Home", icon: <HomeIcon />, path: "/" },
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Materials", icon: <ScienceIcon />, path: "/materials" },
    { label: "Machines", icon: <PrecisionManufacturingIcon />, path: "/machines" },
    { label: "Schedule", icon: <CalendarMonthIcon />, path: "/calendar" },
  ];

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "primary.main",
        color: "white",
        height: "100vh",
        padding: 2,
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Smart Lab
      </Typography>

      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mb: 1,
              backgroundColor:
                location.pathname === item.path ? "rgba(255,255,255,0.2)" : "transparent",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
