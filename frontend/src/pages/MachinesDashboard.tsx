// 📁 MachinesDashboard.tsx

import React, { useEffect, useState, useRef } from "react";
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
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import AddMachineDialog from "../components/AddMachineDialog";
import { useLocation } from "react-router-dom";

dayjs.extend(customParseFormat);

interface Machine {
  ID: string | number;
  "Instrument ID": string;
  "Calibration Date": any;
  "Calibration interval": string;
  "Next Calibration"?: string;
  Department?: string;
  Location?: string;
  "Instrument type"?: string;
  "Calibrated by"?: string;
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
  const cleaned = String(dateInput).trim().replaceAll("-", "/").replaceAll(".", "/").replace(/\s+/g, "");
  const formatsToTry = ["DD/MM/YYYY", "D/M/YYYY", "YYYY-MM-DD"];
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
  const [openNoteDialog, setOpenNoteDialog] = useState<string | null>(null);
  const [sampleComments, setSampleComments] = useState<any[]>([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const highlightedId = params.get("highlight") ?? "";

  const machineRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    if (highlightedId && machineRefs.current[String(highlightedId)]) {
      setTimeout(() => {
        machineRefs.current[String(highlightedId)]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [machines, highlightedId]);

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
      const intervalMonths = parseInt(machine["Calibration interval"].toLowerCase().replace("m", ""));
      const nextCalibration = today.add(intervalMonths, "month");

      const payload = {
        "Calibration Date": today.format("YYYY-MM-DD"),
        "Next Calibration": nextCalibration.format("YYYY-MM-DD"),
        "Calibration interval": machine["Calibration interval"],
      };

      await axios.put(`http://localhost:3000/api/machines/${machine.ID}`, payload);
      setOpenSuccessDialog(true);
      await fetchMachines();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update calibration.");
    }
  };

  const fetchCommentsForMachine = async (instrumentId: string) => {
    try {
      const res = await axios.get("http://localhost:3000/api/samples/all");
      const matching = res.data.filter((s: any) => s.MachineMade === instrumentId);
      setSampleComments(matching);
      setOpenNoteDialog(instrumentId);
    } catch (err) {
      console.error("Failed to fetch sample comments:", err);
      setSampleComments([{ comment: "⚠️ Error loading comments" }]);
      setOpenNoteDialog(instrumentId);
    }
  };

  const sortedMachines = machines
    .map((machine) => {
      const info = getCalibrationInfo(machine["Calibration Date"], machine["Calibration interval"]);
      return { ...machine, calibrationInfo: info };
    })
    .sort((a, b) => getPriority(a.calibrationInfo.chipLabel) - getPriority(b.calibrationInfo.chipLabel));

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fb", width: "100%", boxSizing: "border-box" }}>
      <Typography variant="body1" sx={{ mb: 3, textAlign: "left" }}>
        Total machines loaded: {machines.length}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={() => setOpenAddDialog(true)}>+ ADD MACHINE</Button>
        <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>
          Filter
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {["All", "Calibrated Recently", "Calibration Due Soon", "Calibration Overdue"].map((option) => (
            <MenuItem key={option} selected={filter === option} onClick={() => {
              setFilter(option);
              setAnchorEl(null);
            }}>{option}</MenuItem>
          ))}
        </Menu>
        <TextField
          label="Search machines..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 570 }}
        />
      </Stack>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(3, 1fr)" }}>
        {sortedMachines.map((machine) => {
          const { nextCalibration, chipLabel, chipColor } = machine.calibrationInfo;
          const idStr = String(machine.ID);
          const isHighlighted = idStr === highlightedId;

          if (
            (filter !== "All" && chipLabel !== filter) ||
            !machine["Instrument ID"].toLowerCase().includes(searchTerm.toLowerCase())
          ) return null;

          const isUpdatable = chipLabel === "Calibration Due Soon" || chipLabel === "Calibration Overdue";
          const calibrationDateStr = parseDateSmart(machine["Calibration Date"])?.format("DD/MM/YYYY") ?? "Invalid";

          return (
            <Card
              key={idStr}
              ref={(el) => (machineRefs.current[idStr] = el)}
              sx={{
                borderRadius: 3,
                boxShadow: 4,
                bgcolor: "#ffffff",
                border: isHighlighted ? "3px solid #0D47A1" : "none",
                transition: "all 0.3s ease-in-out",
                position: "relative"
              }}
            >
              <IconButton
                onClick={() => fetchCommentsForMachine(machine["Instrument ID"])}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "#e3f2fd",
                  '&:hover': { backgroundColor: "#bbdefb" }
                }}
                size="small"
              >
                <NoteAltIcon fontSize="small" />
              </IconButton>

              <CardContent sx={{ px: 2, pt: 2, pb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
                  <Chip
                    label={chipLabel}
                    size="small"
                    sx={{
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      px: 2,
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor:
                        chipColor === "success"
                          ? "#2e7d32"
                          : chipColor === "warning"
                            ? "#ed6c02"
                            : "#d32f2f",
                    }}
                  />
                </Box>

                <Typography variant="subtitle1" fontWeight="bold" color="primary" align="left">
                  {machine["Instrument ID"]}
                </Typography>
                <Typography variant="body2" align="left">
                  Calibration Date: {calibrationDateStr}
                </Typography>
                <Typography variant="body2" align="left">
                  Interval: {machine["Calibration interval"]}
                </Typography>
                <Typography variant="body2" align="left">
                  Next Calibration: {nextCalibration}
                </Typography>

                <Collapse in={expandedCard === idStr}>
                  <Box mt={1}>
                    <Typography variant="body2" align="left">ID: {machine.ID}</Typography>
                    <Typography variant="body2" align="left">Department: {machine.Department || "—"}</Typography>
                    <Typography variant="body2" align="left">Location: {machine.Location || "—"}</Typography>
                    <Typography variant="body2" align="left">Type: {machine["Instrument type"] || "—"}</Typography>
                    <Typography variant="body2" align="left">Calibrated by: {machine["Calibrated by"] || "—"}</Typography>
                  </Box>
                </Collapse>
              </CardContent>

              <Box px={2} pb={2}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={!isUpdatable}
                    sx={{ fontSize: '0.65rem' }}
                    onClick={() => handleUpdateCalibration(machine)}
                  >
                    Calibration Is Done
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={expandedCard === idStr ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => toggleExpand(idStr)}
                  >
                    Expand
                  </Button>
                </Stack>
              </Box>
            </Card>
          );
        })}
      </Box>

      <Dialog open={!!openNoteDialog} onClose={() => setOpenNoteDialog(null)}>
        <DialogTitle>Machine Notes - {openNoteDialog}</DialogTitle>
        <DialogContent dividers>
          {sampleComments.length === 0 ? (
            <Typography>No comments found.</Typography>
          ) : (
            <Box>
              {sampleComments.map((sample: any, index: number) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Typography variant="body2">
                    <strong>Sample:</strong> {sample.sampleName || "Unnamed"}
                  </Typography>
                  {sample.comment ? (
                    <>
                      <Typography variant="body2"><strong>Comment:</strong> {sample.comment.text}</Typography>
                      <Typography variant="body2"><strong>Comment Date:</strong> {sample.comment.date}</Typography>
                    </>
                  ) : (
                    <Typography variant="body2"><strong>Comment:</strong> —</Typography>
                  )}

                  <Typography variant="body2">
                    <strong>Received by:</strong> {sample.receivedBy || "—"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {sample.dateOfReceipt || "—"}
                  </Typography>
                  <hr style={{ margin: '8px 0', borderColor: '#eee' }} />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

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
            <CloseIcon fontSize="small" />
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
