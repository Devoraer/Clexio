// ✅ MachinesDashboard.tsx – עם סטטוס מעל שם, חיפוש וכפתור הוספה
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  Button,
  Chip,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";
import dayjs from "dayjs";

interface Machine {
  ID: string;
  "Instrument ID": string;
  "Calibration Date": string;
  "Calibration interval": string;
  Department?: string;
  Location?: string;
  "Instrument type"?: string;
  "Calibrated by"?: string;
}

// 📅 תאריך חכם
const parseDateSmart = (dateStr: string): dayjs.Dayjs | null => {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const [p1, p2, p3] = parts;
  if (parseInt(p1) > 12) {
    return dayjs(`${p1}/${p2}/${p3}`, "DD/MM/YYYY", true);
  } else {
    return dayjs(`${p2}/${p1}/${p3}`, "DD/MM/YYYY", true);
  }
};

// 🎯 סטטוס הכיול
const getCalibrationInfo = (calibrationDate: string, interval: string) => {
  try {
    const baseDate = parseDateSmart(calibrationDate);
    if (!baseDate || !baseDate.isValid()) {
      return {
        nextCalibration: "N/A",
        chipLabel: "Invalid Date",
        chipColor: "error" as const,
      };
    }

    const intervalMonths = parseInt(interval.toLowerCase().replace("m", ""));
    const nextDate = baseDate.add(intervalMonths, "month");
    const nextCalibration = nextDate.format("DD/MM/YYYY");

    const today = dayjs();
    const daysUntilNext = nextDate.diff(today, "day");
    const daysSinceCalibration = today.diff(baseDate, "day");

    let chipLabel = "Calibrated Recently";
    let chipColor: "success" | "warning" | "error" = "success";

    if (daysUntilNext < 0) {
      chipLabel = "Calibration Overdue";
      chipColor = "error";
    } else if (daysUntilNext <= 30) {
      chipLabel = "Calibration Due Soon";
      chipColor = "warning";
    } else if (daysSinceCalibration <= 14) {
      chipLabel = "Calibrated Recently";
      chipColor = "success";
    }

    return {
      nextCalibration,
      chipLabel,
      chipColor,
    };
  } catch {
    return {
      nextCalibration: "N/A",
      chipLabel: "Invalid Date",
      chipColor: "error",
    };
  }
};

const MachinesDashboard = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3000/api/machines").then((res) => {
      setMachines(res.data);
    });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Machines Dashboard
      </Typography>

      {/* 🔘 כפתור הוספה + פילטר + חיפוש */}
      <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
        <Button variant="contained">+ ADD MACHINE</Button>

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          FILTER
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          {["All", "Calibrated Recently", "Calibration Due Soon", "Calibration Overdue"].map((option) => (
            <MenuItem
              key={option}
              selected={filter === option}
              onClick={() => {
                setFilter(option);
                setAnchorEl(null);
              }}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>

        <TextField
          label="Search machines..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "300px" }}
        />
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="flex-start">
        {machines.map((machine) => {
          const { nextCalibration, chipLabel, chipColor } = getCalibrationInfo(
            machine["Calibration Date"],
            machine["Calibration interval"]
          );

          // 🔎 פילטר + חיפוש
          if (
            (filter !== "All" && chipLabel !== filter) ||
            !machine["Instrument ID"].toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return null;
          }

          return (
            <Box key={machine.ID} width="300px">
              <Card elevation={2}>
                <CardContent sx={{ backgroundColor: "#fafafa", position: "relative" }}>
                  {/* ⚠️ אזהרה אם הכיול עבר */}
                  {chipLabel === "Calibration Overdue" && (
                    <Box
                      position="absolute"
                      top={8}
                      right={8}
                      sx={{ color: "error.main", fontSize: "20px" }}
                      title="Calibration overdue!"
                    >
                      ⚠️
                    </Box>
                  )}

                  {/* ✅ סטטוס הכיול מעל שם המכשיר */}
                  <Chip label={chipLabel} color={chipColor} size="small" sx={{ mb: 1 }} />

                  <Typography variant="h6" color="primary">
                    {machine["Instrument ID"]}
                  </Typography>

                  <Typography variant="body2">
                    Calibration Date: {machine["Calibration Date"]}
                  </Typography>
                  <Typography variant="body2">
                    Interval: {machine["Calibration interval"]}
                  </Typography>
                  <Typography variant="body2">
                    Next Calibration: {nextCalibration}
                  </Typography>

                  <Box mt={1}>
                    <Button
                      size="small"
                      onClick={() => toggleExpand(machine.ID)}
                      endIcon={
                        expandedCard === machine.ID ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )
                      }
                    >
                      Expand
                    </Button>
                  </Box>

                  <Collapse in={expandedCard === machine.ID}>
                    <Box mt={1}>
                      <Typography>ID: {machine.ID}</Typography>
                      <Typography>Department: {machine.Department}</Typography>
                      <Typography>Location: {machine.Location}</Typography>
                      <Typography>
                        Type: {machine["Instrument type"]}
                      </Typography>
                      <Typography>
                        Calibrated by: {machine["Calibrated by"]}
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MachinesDashboard;
