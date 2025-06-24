// 📁 frontend/pages/MachinesDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  Button,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
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

const getCalibrationInfo = (calibrationDate: string, interval: string) => {
  try {
    if (!calibrationDate || calibrationDate.trim() === "") {
      return {
        nextCalibration: "N/A",
        status: "Invalid",
        color: "error" as const,
      };
    }

    const months = parseInt(interval.toLowerCase().replace("m", ""));
    const baseDate = dayjs(calibrationDate, "DD/MM/YYYY", true);

    if (!baseDate.isValid()) {
      return {
        nextCalibration: "N/A",
        status: "Invalid",
        color: "error" as const,
      };
    }

    const nextDate = baseDate.add(months, "month");
    const today = dayjs();
    const diff = nextDate.diff(today, "day");

    let status = "Valid";
    let color: "success" | "warning" | "error" = "success";

    if (diff < 0) {
      status = "Expired";
      color = "error";
    } else if (diff <= 30) {
      status = "Expiring Soon";
      color = "warning";
    }

    return {
      nextCalibration: nextDate.format("DD/MM/YYYY"),
      status,
      color,
    };
  } catch {
    return {
      nextCalibration: "N/A",
      status: "Invalid",
      color: "error",
    };
  }
};

const getCalibrationNote = (status: string) => {
  if (status === "Expired") return "Expired – Immediate calibration required";
  if (status === "Expiring Soon") return "Calibration due soon";
  if (status === "Invalid") return "Calibration date missing or invalid";
  return "Valid – No calibration required";
};

const MachinesDashboard = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
      <Typography variant="h4" mb={3}>
        Machines Dashboard
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="flex-start">
        {machines.map((machine) => {
          const { nextCalibration, status, color } = getCalibrationInfo(
            machine["Calibration Date"],
            machine["Calibration interval"]
          );

          return (
            <Box key={machine.ID} width="300px">
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {machine["Instrument ID"]}
                  </Typography>

                  {/* ⛔️ הסרנו את ה-ID מכאן */}

                  <Typography>
                    Calibration Date: {machine["Calibration Date"]}
                  </Typography>
                  <Typography>
                    Interval: {machine["Calibration interval"]}
                  </Typography>
                  <Typography>
                    Next Calibration: {nextCalibration}
                  </Typography>

                  <Chip label={status} color={color} sx={{ mt: 1 }} />

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {getCalibrationNote(status)}
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
                      <Typography>ID: {machine.ID}</Typography> {/* ✅ ה-ID מופיע רק בהרחבה */}
                      <Typography>Department: {machine.Department}</Typography>
                      <Typography>Location: {machine.Location}</Typography>
                      <Typography>Type: {machine["Instrument type"]}</Typography>
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
