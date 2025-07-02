import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Stack,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// 🧠 Icons
import MedicationLiquidIcon from "@mui/icons-material/Science";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";
import MedicationIcon from "@mui/icons-material/Medication";

// 🖼 אייקון ציוד מתמונה
import MachineIcon from "../icones/machine.png";
import UpcomingRemindersTable from "../components/UpcomingRemindersTable";


export default function HomePage() {
  const navigate = useNavigate();

  const [materialStats, setMaterialStats] = useState({
    total: 0,
    expiringSoon: 0,
  });

  const [sampleStats, setSampleStats] = useState({
    total: 0,
  });

  const [equipmentStats, setEquipmentStats] = useState({
    total: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetch("http://localhost:3000/api/materials/summary")
      .then((res) => res.json())
      .then((data) => setMaterialStats(data))
      .catch((err) => console.error("❌ Error fetching material summary:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/samples/summary")
      .then((res) => res.json())
      .then((data) => setSampleStats(data))
      .catch((err) => console.error("❌ Error fetching sample summary:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/machines/summary")
      .then((res) => res.json())
      .then((data) => setEquipmentStats(data))
      .catch((err) => console.error("❌ Error fetching equipment summary:", err));
  }, []);

  const cards = [
    {
      title: "Equipment",
      icon: (
        <Box
          sx={{
            backgroundColor: "#e8edfa",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            overflow: "hidden",
          }}
        >
          <img src={MachineIcon} alt="Machine" style={{ width: 36, height: 36 }} />
        </Box>
      ),
      route: "/machines",
      stats: (
        <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
          <Chip
            label={`Total: ${equipmentStats.total}`}
            sx={{
              bgcolor: "#f0f0f0",
              color: "#333",
              fontWeight: "bold",
              transition: "0.3s",
              ":hover": { boxShadow: 2 },
            }}
          />
          <Chip
            label={`${equipmentStats.overdue} overdue`}
            sx={{
              bgcolor: "#fdecea",
              color: "#d32f2f",
              fontWeight: "bold",
              transition: "0.3s",
              ":hover": { boxShadow: 2 },
            }}
          />
        </Stack>
      ),
    },
    {
      title: "Samples",
      icon: (
        <Box
          sx={{
            backgroundColor: "#f3e5f5",
            borderRadius: "50%",
            width: 60,
            height: 60,
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
            label={
              sampleStats.total !== undefined
                ? `Total: ${sampleStats.total}`
                : "Loading..."
            }
            sx={{
              bgcolor: "#f0f0f0",
              color: "#333",
              fontWeight: "bold",
              transition: "0.3s",
              ":hover": { boxShadow: 2 },
            }}
          />
        </Stack>
      ),
    },
    {
      title: "Materials",
      icon: (
        <Box
          sx={{
            backgroundColor: "#e5f7ef",
            borderRadius: "50%",
            width: 60,
            height: 60,
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
            sx={{
              bgcolor: "#f0f0f0",
              color: "#333",
              fontWeight: "bold",
              transition: "0.3s",
              ":hover": { boxShadow: 2 },
            }}
          />
          <Chip
            label={`${materialStats.expiringSoon} expiring soon`}
            sx={{
              bgcolor: "#fff3e0",
              color: "#fb8c00",
              fontWeight: "bold",
              transition: "0.3s",
              ":hover": { boxShadow: 2 },
            }}
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
        <Typography
          variant="h4"
          fontWeight={700}
          mb={4}
          sx={{
            color: "#2c3e50",
            background: "linear-gradient(to right, #2196f3, #21cbf3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
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
                minHeight: 220,
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
                  {card.stats}
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      

        {/* 📋 טבלת הדברים הקרובים */}
        <Box mt={6} width="100%" maxWidth="900px">
          <Typography variant="h5" mb={2} textAlign="center" color="primary">
            🔔 Urgent Alerts
          </Typography>
          <UpcomingRemindersTable />
        </Box>

      </Box>
    </Box>
    
  );
}