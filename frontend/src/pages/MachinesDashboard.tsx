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
        chipLabel: "Invalid Date",
        chipColor: "error" as const,
      };
    }

    // 📆 נשתמש בפורמט תקני
    const baseDate = dayjs(calibrationDate, "DD/MM/YYYY", true);

    if (!baseDate.isValid()) {
      return {
        nextCalibration: "N/A",
        status: "Invalid",
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
    } else if (daysUntilNext <= 14) {
      chipLabel = "Calibration Due Soon";
      chipColor = "warning";
    } else if (daysSinceCalibration <= 14) {
      chipLabel = "Calibrated Recently";
      chipColor = "success";
    }

    return {
      nextCalibration,
      status: chipLabel,
      chipLabel,
      chipColor,
    };
  } catch {
    return {
      nextCalibration: "N/A",
      status: "Invalid",
      chipLabel: "Invalid Date",
      chipColor: "error",
    };
  }
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
          const { nextCalibration, chipLabel, chipColor } = getCalibrationInfo(
            machine["Calibration Date"],
            machine["Calibration interval"]
          );

          return (
            <Box key={machine.ID} width="300px">
              <Card elevation={2}>
                <CardContent sx={{ backgroundColor: "#fafafa" }}>
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
                    <Chip label={chipLabel} color={chipColor} size="small" />
                  </Box>

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
