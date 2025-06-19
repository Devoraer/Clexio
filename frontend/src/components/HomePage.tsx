// 🏠 src/pages/HomePage.tsx (redesigned with sidebar and English only)

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing"; // Equipment
import ScienceIcon from "@mui/icons-material/Science"; // Samples
import InventoryIcon from "@mui/icons-material/Inventory"; // Materials
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";

export default function HomePage() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Equipment",
      description: "Manage and track all lab equipment",
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 60, color: "#3f51b5" }} />,
      route: "/machines",
    },
    {
      title: "Samples",
      description: "Track lab samples and their analysis",
      icon: <ScienceIcon sx={{ fontSize: 60, color: "#9c27b0" }} />,
      route: "/samples",
    },
    {
      title: "Materials",
      description: "Manage inventory of lab chemicals and supplies",
      icon: <InventoryIcon sx={{ fontSize: 60, color: "#009688" }} />,
      route: "/materials",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          background: "linear-gradient(to bottom, #1976d2, #1565c0)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 4,
          gap: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Smart Lab
        </Typography>
        <CardActionArea onClick={() => navigate("/")}> 
          <Box display="flex" alignItems="center" gap={1}>
            <HomeIcon /> <Typography>Home</Typography>
          </Box>
        </CardActionArea>
        <CardActionArea
          onClick={() => window.open("https://calendar.google.com", "_blank")}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarMonthIcon /> <Typography>Calendar</Typography>
          </Box>
        </CardActionArea>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#f4f7fb",
          p: 4,
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={4} color="#3f3f3f">
          Lab Dashboard 🧪
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {cards.map((card, index) => (
            <Card
              key={index}
              sx={{
                width: 280,
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                boxShadow: 5,
                textAlign: "center",
                transition: "0.3s",
                ":hover": {
                  transform: "scale(1.03)",
                  boxShadow: 8,
                },
                backgroundColor: "white",
              }}
            >
              <CardActionArea
                onClick={() => navigate(card.route)}
                sx={{ p: 2 }}
              >
                <CardContent>
                  <Box mb={2}>{card.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.9rem" }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}