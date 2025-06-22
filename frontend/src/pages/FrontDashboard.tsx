import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import ScienceIcon from "@mui/icons-material/Science";
import BuildIcon from "@mui/icons-material/Build";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import { useEffect, useState } from "react";

export default function FrontDashboard() {
  const navigate = useNavigate();
  const [machinesCount, setMachinesCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:3000/api/machines")
      .then((res) => res.json())
      .then((data) => setMachinesCount(data.length))
      .catch((err) => console.error("שגיאה בשליפת מכשירים:", err));
  }, []);

  return (
    <Box sx={{ display: "flex", direction: "rtl", height: "100vh" }}>
      <Sidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <DashboardHeader />

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
          }}
        >
          {/* Equipment Card */}
          <Box sx={{ width: { xs: "100%", sm: "45%", md: "30%" } }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">ציוד</Typography>
              </Box>
              <Typography variant="body2">
                ניהול ומעקב אחר כל הציוד והמכשירים במעבדה
              </Typography>
              <Box mt={2}>
                <Typography>סה"כ מכשירים: {machinesCount}</Typography>
                <Typography>פעילים: ?</Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate("/equipment")}
              >
                כניסה לציוד
              </Button>
            </Paper>
          </Box>

          {/* Samples Card */}
          <Box sx={{ width: { xs: "100%", sm: "45%", md: "30%" } }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ScienceIcon color="secondary" />
                <Typography variant="h6">דגימות</Typography>
              </Box>
              <Typography variant="body2">
                מעקב אחר הדגימות ותהליכי הבדיקה שלהן
              </Typography>
              <Box mt={2}>
                <Typography>סה"כ דגימות: 12</Typography>
                <Typography>בבדיקה: 3</Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate("/samples")}
              >
                כניסה לדגימות
              </Button>
            </Paper>
          </Box>

          {/* Materials Card */}
          <Box sx={{ width: { xs: "100%", sm: "45%", md: "30%" } }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BuildIcon color="info" />
                <Typography variant="h6">חומרים</Typography>
              </Box>
              <Typography variant="body2">
                ניהול מלאי חומרי הגלם וחומצות המעבדה
              </Typography>
              <Box mt={2}>
                <Typography>סה"כ חומרים: 24</Typography>
                <Typography>חסרים: 2</Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate("/materials")}
              >
                כניסה לחומרים
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
