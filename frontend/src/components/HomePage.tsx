// 📁 HomePage.tsx

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
import dayjs from "dayjs";

import MedicationLiquidIcon from "@mui/icons-material/Science";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";
import MedicationIcon from "@mui/icons-material/Medication";

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
    inProgress: 0,
    stabilityInProgress: 0,
  });

  const [equipmentStats, setEquipmentStats] = useState({
    total: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetch("http://localhost:3000/api/materials")
      .then((res) => res.json())
      .then((data) => {
        const now = dayjs();
        const in30Days = now.add(30, "day");

        const expiringSoon = data.filter((mat: any) => {
          const raw = mat["Expiry Date"];
          let expiry = null;

          if (raw && typeof raw === "string") {
            expiry = dayjs(raw, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]);
          } else if (raw?.toDate) {
            expiry = dayjs(raw.toDate());
          }

          return expiry && expiry.isValid() && expiry.isAfter(now) && expiry.isBefore(in30Days);
        });

        setMaterialStats({
          total: data.length,
          expiringSoon: expiringSoon.length,
        });
      })
      .catch((err) => console.error("❌ Error fetching materials:", err));
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
        <Stack direction="column" spacing={1} alignItems="center" mt={2}>
          <Chip
            label={`Total: ${equipmentStats.total}`}
            sx={{
              bgcolor: "#f0f0f0",
              color: "#333",
              fontWeight: "bold",
              fontSize: "0.85rem",
              px: 5.5,
              borderRadius: "8px",
            }}
          />
          <Chip
            label={`${equipmentStats.overdue} overdue`}
            sx={{
              bgcolor: "#fdecea",
              color: "#d32f2f",
              fontWeight: "bold",
              fontSize: "0.85rem",
              px: 5,
              borderRadius: "8px",
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
        <Stack direction="column" spacing={1} alignItems="center" mt={2}>
          <Chip
            label={`${sampleStats.inProgress} Samples in process`}
            sx={{
              bgcolor: "#ffe0b2",
              color: "#e65100",
              fontWeight: "bold",
              fontSize: "0.85rem",
              px: 2,
              borderRadius: "8px",
            }}
          />
          <Chip
            label={`${sampleStats.stabilityInProgress} Stability in process`}
            sx={{
              bgcolor: "#d1c4e9",
              color: "#4a148c",
              fontWeight: "bold",
              fontSize: "0.85rem",
              px: 2,
              borderRadius: "8px",
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
        <Stack direction="column" spacing={1} alignItems="center" mt={2}>
          <Chip
            label={`Total: ${materialStats.total}`}
             sx={{
              bgcolor: "#f0f0f0",
              color: "#333",
              fontWeight: "bold",
              fontSize: "0.85rem",
              px: 5,
              borderRadius: "8px",
            }}
          />
          <Chip
            label={`${materialStats.expiringSoon} expiring soon`}
            sx={{
              bgcolor: "#ffe0b2",
              color: "#e65100",
              fontWeight: "bold",
              fontSize: "0.85rem",
              px: 2,
              borderRadius: "8px",
            }}
          />
        </Stack>
      ),
    },
  ];


  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          background: "#f4f7fb",
          p: 4,
        }}
      >
        <Box
          mt={2}
          width="100%"
          maxWidth="900px"
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 3,
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
            <UpcomingRemindersTable />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "center",
            mt: 6,
          }}
        >
          {cards.map((card, index) => (
            <Card
              key={index}
              sx={{
                width: 261,
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
      </Box>
    </Box>
  );
}
