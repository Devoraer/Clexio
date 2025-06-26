// ✅ SamplesDashboard.tsx – גרסה עם מיון לפי In progress קודם + שמירה בפורמט dd/mm/yyyy
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

interface Sample {
  ID: number;
  dateOfReceipt: string;
  clexioNumber: string;
  sampleName: string;
  containers: number;
  testsRequired: boolean;
  projectName: string;
  receivedFrom: string;
  storage: string;
  receivedBy: string;
  comment: string;
  completionDate: string;
  completedBy: string;
}

const SamplesDashboard = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"All" | "Completed" | "In progress">("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [updateFields, setUpdateFields] = useState<{
    [id: number]: { containers: string; completionDate: string; completedBy: string };
  }>({});

  const fetchSamples = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/samples");
      const mapped: Sample[] = response.data.map((item: any) => ({
        ID: item.ID,
        dateOfReceipt: item.dateOfReceipt,
        clexioNumber: item.clexioNumber,
        sampleName: item.sampleName,
        containers: item.containers,
        testsRequired: item.testsRequired,
        projectName: item.projectName,
        receivedFrom: item.receivedFrom,
        storage: item.storage,
        receivedBy: item.receivedBy,
        comment: item.comment,
        completionDate: item.completionDate,
        completedBy: item.completedBy,
      }));
      setSamples(mapped);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const getStatus = (sample: Sample) => {
    const rawDate = sample.completionDate;
    if (rawDate) {
      if (rawDate.includes("/")) {
        const [day, month, year] = rawDate.split("/").map(Number);
        const completion = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!isNaN(completion.getTime()) && completion <= today) {
          return { status: "Completed", color: "success", weight: 0 };
        }
      }
    }
    return { status: "In progress", color: "warning", weight: 1 };
  };

  const handleUpdate = async (id: number) => {
    const fields = updateFields[id];
    if (!fields || (!fields.completionDate && !fields.completedBy)) {
      alert("Please fill in at least one field (Completion Date or Completed By) before updating.");
      return;
    }

    try {
      const updateData: any = {};
      if (fields.completionDate) {
        const [year, month, day] = fields.completionDate.split("-");
        updateData.completionDate = `${day}/${month}/${year}`; // 👉 הפורמט המבוקש
      }
      if (fields.completedBy) {
        updateData.completedBy = fields.completedBy;
      }

      await axios.put(`http://localhost:3000/api/samples/${id}/completion`, updateData);
      await fetchSamples(); // ריענון לאחר עדכון
      setUpdateFields((prev) => ({ ...prev, [id]: { containers: "", completionDate: "", completedBy: "" } }));
    } catch (error) {
      console.error("Update error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
      }
    }
  };

  const filteredSamples = samples
    .filter((s) => {
      const status = getStatus(s).status;
      return statusFilter === "All" || status === statusFilter;
    })
    .filter((s) => s.sampleName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => getStatus(b).weight - getStatus(a).weight); // 👉 In Progress ראשון

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fb", width: "100%", boxSizing: "border-box" }}>
      <Typography variant="h4" gutterBottom>Samples Dashboard</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>Total samples loaded: {samples.length}</Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={fetchSamples}>Add Sample</Button>
        <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>Filter</Button>
        <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
          {["All", "Completed", "In progress"].map((status) => (
            <MenuItem key={status} selected={statusFilter === status} onClick={() => {
              setStatusFilter(status as typeof statusFilter);
              setAnchorEl(null);
            }}>{status}</MenuItem>
          ))}
        </Menu>
        <TextField variant="outlined" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search samples..." sx={{ flexGrow: 1, minWidth: "220px" }} />
      </Stack>

      <Box sx={{
        display: "grid",
        gap: 3,
        width: "100%",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
      }}>
        {filteredSamples.map((sample) => {
          const status = getStatus(sample);
          return (
            <Card key={sample.ID} sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: 250,
                justifyContent: "space-between",
                padding: 2,
              }}>
                <Box sx={{ mb: 1 }}>
                  <Chip label={status.status} color={status.color as any} sx={{ mb: 1 }} />
                  <Typography variant="h6" sx={{ color: "#0288d1", fontWeight: "bold", minHeight: "40px", fontSize: "1.1rem" }}>
                    {sample.sampleName}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">ID: {sample.ID}</Typography>
                  <Typography variant="body2">Date of Receipt: {sample.dateOfReceipt}</Typography>
                  <Typography variant="body2">Clexio Number: {sample.clexioNumber}</Typography>
                  <Typography variant="body2">Containers: {sample.containers}</Typography>
                </Box>

                {status.status === "In progress" && (
                  <Box sx={{ mb: 2 }}>
                    <Stack spacing={1.5}>
                      <TextField
                        label="Completion Date"
                        type="date"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={updateFields[sample.ID]?.completionDate || ""}
                        onChange={(e) => {
                          setUpdateFields((prev) => ({
                            ...prev,
                            [sample.ID]: {
                              ...prev[sample.ID],
                              completionDate: e.target.value,
                            },
                          }));
                        }}
                      />
                      <TextField
                        label="Completed By"
                        size="small"
                        fullWidth
                        value={updateFields[sample.ID]?.completedBy || ""}
                        onChange={(e) => {
                          setUpdateFields((prev) => ({
                            ...prev,
                            [sample.ID]: {
                              ...prev[sample.ID],
                              completedBy: e.target.value,
                            },
                          }));
                        }}
                      />
                    </Stack>
                  </Box>
                )}

                <Box sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    {status.status === "In progress" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdate(sample.ID)}
                      >
                        Update
                      </Button>
                    )}
                    <Button
                      size="small"
                      endIcon={<ExpandMoreIcon />}
                      onClick={() => {
                        setSelectedSample(sample);
                        setShowDialog(true);
                      }}
                    >
                      Expand
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {selectedSample && (
        <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
          <DialogTitle>{selectedSample.sampleName}</DialogTitle>
          <DialogContent dividers>
            <Typography>ID: {selectedSample.ID}</Typography>
            <Typography>Date of Receipt: {selectedSample.dateOfReceipt}</Typography>
            <Typography>Clexio Number: {selectedSample.clexioNumber}</Typography>
            <Typography>Sample Name: {selectedSample.sampleName}</Typography>
            <Typography>Number of Containers Received: {selectedSample.containers}</Typography>
            <Typography>Tests Required: {selectedSample.testsRequired ? "Yes" : "No"}</Typography>
            <Typography>Project Name: {selectedSample.projectName}</Typography>
            <Typography>Received From: {selectedSample.receivedFrom}</Typography>
            <Typography>Place of Storage: {selectedSample.storage}</Typography>
            <Typography>Received By: {selectedSample.receivedBy}</Typography>
            <Typography>Comment: {selectedSample.comment}</Typography>
            <Typography>Tests Completion Date: {selectedSample.completionDate}</Typography>
            <Typography>Completed By: {selectedSample.completedBy}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SamplesDashboard;