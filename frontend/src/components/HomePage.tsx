import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Icons
import FactoryIcon from "@mui/icons-material/Factory";
import MedicationLiquidIcon from "@mui/icons-material/Science"; 
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";
import MedicationIcon from "@mui/icons-material/Medication"; 

export default function HomePage() {
  const navigate = useNavigate();

  // 🔢 סטטיסטיקות של החומרים
  const [materialStats, setMaterialStats] = useState({
    total: 0,
    expiringSoon: 0,
  });

  // 🔢 סטטיסטיקות של דגימות
  const [sampleStats, setSampleStats] = useState({
    total: 0,
  });

  // 📡 שליפת חומרים
  useEffect(() => {
    fetch("http://localhost:3000/api/materials/summary")
      .then((res) => res.json())
      .then((data) => setMaterialStats(data))
      .catch((err) => console.error("❌ Error fetching material summary:", err));
  }, []);

  // 📡 שליפת דגימות
  useEffect(() => {
    fetch("http://localhost:3000/api/samples/summary")
      .then((res) => res.json())
      .then((data) => setSampleStats(data))
      .catch((err) => console.error("❌ Error fetching sample summary:", err));
  }, []);

  // 🎴 כרטיסי הדשבורד
  const cards = [
    {
      title: "Equipment",
      description: "Manage and track all lab equipment",
      icon: (
        <Box
          sx={{
            backgroundColor: "#e8edfa",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <FactoryIcon sx={{ fontSize: 28, color: "#3f51b5" }} />
        </Box>
      ),
      route: "/machines",
    },
    {
      title: "Samples",
      description: "Track lab samples and their analysis",
      icon: (
        <Box
          sx={{
            backgroundColor: "#f3e5f5",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <MedicationIcon sx={{ fontSize: 28, color: "#9c27b0" }} />
        </Box>
      ),
      route: "/samples",
      stats: (
        <Stack direction="row" justifyContent="center" mt={2}>
          <Chip
            label={`Total: ${sampleStats.total}`}
            sx={{ bgcolor: "#f0f0f0", color: "#333", fontWeight: "bold" }}
          />
        </Stack>
      ),
    },
    {
      title: "Materials",
      description: "Manage inventory of lab chemicals and expiry dates",
      icon: (
        <Box
          sx={{
            backgroundColor: "#e5f7ef",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <MedicationLiquidIcon sx={{ fontSize: 28, color: "#4caf50" }} />
        </Box>
      ),
      route: "/materials",
      stats: (
        <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
          <Chip
            label={`Total: ${materialStats.total}`}
            sx={{ bgcolor: "#f0f0f0", color: "#333", fontWeight: "bold" }}
          />
          <Chip
            label={`${materialStats.expiringSoon} expiring soon`}
            sx={{ bgcolor: "#fff3e0", color: "#fb8c00", fontWeight: "bold" }}
          />
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* 📌 Sidebar */}
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

      {/* 📊 Main Dashboard */}
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
          Lab Dashboard
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
                minHeight: 260,
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
              <CardActionArea onClick={() => navigate(card.route)} sx={{ p: 2 }}>
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
                  {card.stats}
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
