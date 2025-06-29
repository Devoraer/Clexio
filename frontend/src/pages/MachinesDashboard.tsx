// 📁 src/pages/MachinesDashboard.tsx

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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import AddMachineDialog from "../components/AddMachineDialog";

dayjs.extend(customParseFormat);

interface Machine {
  ID: string;
  "Instrument ID": string;
  "Calibration Date": any;
  "Calibration interval": string;
  "Next Calibration"?: string;
  Department?: string;
  Location?: string;
  "Instrument Type"?: string;
  "Calibrated By"?: string;
}

const parseDateSmart = (dateInput: any): dayjs.Dayjs | null => {
  if (!dateInput) return null;

  if (typeof dateInput === "object") {
    if ("seconds" in dateInput && "nanoseconds" in dateInput) {
      const ms = dateInput.seconds * 1000 + Math.floor(dateInput.nanoseconds / 1_000_000);
      const parsed = dayjs(ms);
      return parsed.isValid() ? parsed : null;
    }

    if (typeof dateInput.toDate === "function") {
      const parsed = dayjs(dateInput.toDate());
      return parsed.isValid() ? parsed : null;
    }
  }

  const cleaned = String(dateInput)
    .trim()
    .replaceAll('"', "")
    .replaceAll("-", "/")
    .replaceAll(".", "/")
    .replace(/\s+/g, "");

  const formatsToTry = [
    "DD/MM/YYYY", "D/M/YYYY",
    "DD-MM-YYYY", "D-M-YYYY",
    "DD.MM.YYYY", "D.M.YYYY"
  ];

  for (const format of formatsToTry) {
    const parsed = dayjs(cleaned, format, true);
    if (parsed.isValid()) return parsed;
  }

  return null;
};

const getCalibrationInfo = (calibrationDate: any, interval: string) => {
  const baseDate = parseDateSmart(calibrationDate);
  if (!baseDate) {
    return {
      nextCalibration: "N/A",
      chipLabel: "Invalid Date",
      chipColor: "error" as const,
    };
  }

  const intervalMonths = parseInt(interval.toLowerCase().replace("m", ""));
  const nextDate = baseDate.add(intervalMonths, "month");
  const today = dayjs().startOf("day");
  const daysUntilNext = nextDate.diff(today, "day");

  let chipLabel = "Calibrated Recently";
  let chipColor: "success" | "warning" | "error" = "success";

  if (daysUntilNext < 0) {
    chipLabel = "Calibration Overdue";
    chipColor = "error";
  } else if (daysUntilNext <= 30) {
    chipLabel = "Calibration Due Soon";
    chipColor = "warning";
  }

  return {
    nextCalibration: nextDate.format("DD/MM/YYYY"),
    chipLabel,
    chipColor,
  };
};

const getPriority = (label: string): number => {
  if (label === "Calibration Overdue") return 1;
  if (label === "Calibration Due Soon") return 2;
  if (label === "Calibrated Recently") return 3;
  return 4;
};

const MachinesDashboard = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    const res = await axios.get("http://localhost:3000/api/machines/all");
    setMachines(res.data);
  };

  const toggleExpand = (id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  const handleUpdateCalibration = async (machine: Machine) => {
    try {
      const today = dayjs();
      const intervalMonths = parseInt(
        machine["Calibration interval"].toLowerCase().replace("m", "")
      );
      const nextCalibration = today.add(intervalMonths, "month");

      const payload = {
        "Calibration Date": today.format("YYYY-MM-DD"),
        "Next Calibration": nextCalibration.format("YYYY-MM-DD"),
        "Calibration interval": machine["Calibration interval"],
      };

      await axios.put(
        `http://localhost:3000/api/machines/${machine.ID}`,
        payload
      );

      setOpenSuccessDialog(true);
      await fetchMachines();

    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update calibration.");
    }
  };

  const sortedMachines = machines
    .map((machine) => {
      const info = getCalibrationInfo(machine["Calibration Date"], machine["Calibration interval"]);
      return { ...machine, calibrationInfo: info };
    })
    .sort((a, b) => getPriority(a.calibrationInfo.chipLabel) - getPriority(b.calibrationInfo.chipLabel));

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Machines Dashboard</Typography>

      <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
        <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
          + ADD MACHINE
        </Button>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >Filter</Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {["All", "Calibrated Recently", "Calibration Due Soon", "Calibration Overdue"].map((option) => (
            <MenuItem
              key={option}
              selected={filter === option}
              onClick={() => {
                setFilter(option);
                setAnchorEl(null);
              }}
            >{option}</MenuItem>
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

      <Box display="flex" flexWrap="wrap" gap={2.5}>
        {sortedMachines.map((machine) => {
          const {
            nextCalibration,
            chipLabel,
            chipColor,
          } = machine.calibrationInfo;

          if (
            (filter !== "All" && chipLabel !== filter) ||
            !machine["Instrument ID"].toLowerCase().includes(searchTerm.toLowerCase())
          ) return null;

          const isUpdatable = chipLabel === "Calibration Due Soon" || chipLabel === "Calibration Overdue";
          const calibrationDateStr = parseDateSmart(machine["Calibration Date"])?.format("DD/MM/YYYY") ?? "Invalid";

          return (
            <Card key={machine.ID} sx={{
              width: 270,
              borderRadius: 3,
              backgroundColor: "#fefefe",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              position: "relative",
            }}>
              <CardContent sx={{ px: 2, pt: 6, pb: 2 }}>
                <Chip
                  label={chipLabel}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    borderRadius: "999px",
                    height: 24,
                    fontSize: "0.75rem",
                    px: 2,
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor:
                      chipColor === "success" ? "#2e7d32" :
                      chipColor === "warning" ? "#ed6c02" :
                      "#d32f2f",
                  }}
                />

                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  {machine["Instrument ID"]}
                </Typography>

                <Typography variant="body2">
                  Calibration Date: {calibrationDateStr}
                </Typography>
                <Typography variant="body2">
                  Interval: {machine["Calibration interval"]}
                </Typography>
                <Typography variant="body2">
                  Next Calibration: {nextCalibration}
                </Typography>

                <Stack direction="row" spacing={1} mt={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={!isUpdatable}
                    onClick={() => handleUpdateCalibration(machine)}
                  >Update</Button>

                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "#1976d2",
                      borderColor: "#1976d2",
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        borderColor: '#1565c0',
                      }
                    }}
                    endIcon={expandedCard === machine.ID ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => toggleExpand(machine.ID)}
                  >Expand</Button>
                </Stack>

                <Collapse in={expandedCard === machine.ID}>
                  <Box mt={1}>
                    <Typography variant="body2">ID: {machine.ID}</Typography>
                    <Typography variant="body2">Department: {machine.Department || "—"}</Typography>
                    <Typography variant="body2">Location: {machine.Location || "—"}</Typography>
                    <Typography variant="body2">Type: {machine["Instrument Type"] || "—"}</Typography>
                    <Typography variant="body2">Calibrated by: {machine["Calibrated By"] || "—"}</Typography>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon color="success" />
          Calibration updated successfully
          <IconButton
            aria-label="close"
            onClick={() => setOpenSuccessDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              border: '1px solid #1976d2',
              color: '#1976d2',
              borderRadius: '4px',
              fontSize: '0.875rem',
              padding: '2px 6px',
              '&:hover': {
                backgroundColor: '#e3f2fd',
                borderColor: '#1565c0',
              },
            }}
          >
            Close
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>All changes were saved successfully.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuccessDialog(false)} autoFocus variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <AddMachineDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSuccess={() => fetchMachines()}
      />
    </Box>
  );
};

export default MachinesDashboard;
