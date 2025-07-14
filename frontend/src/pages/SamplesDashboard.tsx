import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Chip, TextField, Button,
  Stack, Menu, MenuItem, Paper, Collapse
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ScienceIcon from "@mui/icons-material/Science";
import AssignmentIcon from "@mui/icons-material/Assignment";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddSample from "../components/AddSample";


type Sample = {
  ID: number;
  dateOfReceipt: string;
  clexioNumber: string;
  sampleName: string;
  containers: string;
  testsRequired: string;
  projectName: string;
  receivedFrom: string;
  storage: string;
  receivedBy: string;
  MachineMade: string;
  comment: string;
  completionDate: string;
  completedBy: string;
};

const SamplesDashboard = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [stabilityItems, setStabilityItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Completed" | "In progress">("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [updateFields, setUpdateFields] = useState<{ [id: number]: { completionDate: string; completedBy: string } }>({});
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [openAddSampleDialog, setOpenAddSampleDialog] = useState(false);


  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id.toString())
        ? prev.filter((item) => item !== id.toString())
        : [...prev, id.toString()]
    );
  };

  const isExpanded = (id: number) => expandedIds.includes(id.toString());

  const fetchSamples = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/samples");
      setSamples(response.data as Sample[]);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  const fetchStability = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/stability-checklist");
      setStabilityItems(response.data);
    } catch (error) {
      console.error("Error fetching stability checklist:", error);
    }
  };

  useEffect(() => {
    fetchSamples();
    fetchStability();
  }, []);

  const getStatus = (sample: Sample) => {
    const rawDate = sample.completionDate;
    if (rawDate && rawDate.includes("/")) {
      const [day, month, year] = rawDate.split("/").map(Number);
      const completion = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!isNaN(completion.getTime()) && completion <= today) {
        return { status: "Completed", color: "success", weight: 0 };
      }
    }
    return { status: "In progress", color: "warning", weight: 1 };
  };

  const getStabilityStatus = (item: any) => {
    if (item["Date3"] && item["Date3"].trim() !== "") {
      return { status: "Completed", color: "success", weight: 0 };
    }
    return { status: "In progress", color: "warning", weight: 1 };
  };

  const handleUpdate = async (id: number) => {
    const fields = updateFields[id];
    if (!fields || (!fields.completionDate && !fields.completedBy)) {
      alert("Please fill in at least one field before updating.");
      return;
    }

    try {
      const updateData: any = {};
      if (fields.completionDate) {
        const [year, month, day] = fields.completionDate.split("-");
        updateData.completionDate = `${day}/${month}/${year}`;
      }
      if (fields.completedBy) {
        updateData.completedBy = fields.completedBy;
      }

      await axios.put(`http://localhost:3000/api/samples/${id}/completion`, updateData);
      await fetchSamples();
      setUpdateFields((prev) => ({ ...prev, [id]: { completionDate: "", completedBy: "" } }));
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const filteredSamples = samples
    .filter((s) => {
      const status = getStatus(s).status;
      return statusFilter === "All" || status === statusFilter;
    })
    .filter((s) => s.sampleName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => getStatus(b).weight - getStatus(a).weight);

  const filteredStabilityItems = stabilityItems
    .filter((item) => (item["Stability Name"] || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => getStabilityStatus(b).weight - getStabilityStatus(a).weight);

  const renderSampleCard = (sample: Sample) => {
    const status = getStatus(sample);
    return (
      <Card key={sample.ID} sx={{ borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <Chip label={status.status} color={status.color as any} sx={{ mb: 1 }} />
          <Typography variant="h6" sx={{ color: "#0288d1", fontWeight: "bold" }}>{sample.sampleName}</Typography>
          <Typography variant="body2">ID: {sample.ID}</Typography>
          <Typography variant="body2">Date of Receipt: {sample.dateOfReceipt}</Typography>
          <Typography variant="body2">Clexio Number: {sample.clexioNumber}</Typography>
          <Typography variant="body2">Containers: {sample.containers}</Typography>

          {status.status === "In progress" && (
            <Stack spacing={1.5} mt={1}>
              <TextField
                label="Completion Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={updateFields[sample.ID]?.completionDate || ""}
                onChange={(e) =>
                  setUpdateFields((prev) => ({
                    ...prev,
                    [sample.ID]: {
                      ...prev[sample.ID],
                      completionDate: e.target.value,
                    },
                  }))
                }
              />
              <TextField
                label="Completed By"
                size="small"
                fullWidth
                value={updateFields[sample.ID]?.completedBy || ""}
                onChange={(e) =>
                  setUpdateFields((prev) => ({
                    ...prev,
                    [sample.ID]: {
                      ...prev[sample.ID],
                      completedBy: e.target.value,
                    },
                  }))
                }
              />
              <Button size="small" variant="outlined" onClick={() => handleUpdate(sample.ID)}>Update</Button>
            </Stack>
          )}

          <Button size="small" endIcon={isExpanded(sample.ID) ? <ExpandLessIcon /> : <ExpandMoreIcon />} sx={{ mt: 2 }} onClick={() => toggleExpand(sample.ID)}>Expand</Button>

          <Collapse in={isExpanded(sample.ID)} timeout="auto" unmountOnExit>
            <Box mt={2}>
              <Typography variant="body2">Project Name: {sample.projectName}</Typography>
              <Typography variant="body2">Tests Required: {sample.testsRequired}</Typography>
              <Typography variant="body2">Storage: {sample.storage}</Typography>
              <Typography variant="body2">Received From: {sample.receivedFrom}</Typography>
              <Typography variant="body2">Received By: {sample.receivedBy}</Typography>
              <Typography variant="body2">Machine Made: {sample.MachineMade}</Typography>
              <Typography variant="body2">Comment: {sample.comment}</Typography>
              <Typography variant="body2">Completed By: {sample.completedBy}</Typography>
              <Typography variant="body2">Completion Date: {sample.completionDate}</Typography>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

const renderStabilityCard = (item: any) => {
  const status = getStabilityStatus(item);

  return (
    <Card key={item.ID} sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Chip label={status.status} color={status.color as any} sx={{ mb: 1 }} />

        <Typography variant="h6" sx={{ color: "#0288d1", fontWeight: "bold" }}>
          {/* פתרון ל-Unnamed */}
          {item.stabilityName || item["Stability Name"] || "Unnamed"}
        </Typography>

        {/* פתרון ל-ID לא תקני */}
        <Typography variant="body2">
          ID: {typeof item.ID === "object" ? JSON.stringify(item.ID) : item.ID}
        </Typography>

        <Typography variant="body2">
          Opened Date: {item.openedDate || item["Opened date"] || "-"}
        </Typography>

        <Typography variant="body2">
          Project Name: {item.projectName || item["Project name"] || "-"}
        </Typography>

        <Typography variant="body2">
          Dosage Form: {item.dosageForm || item["Dosage Form"] || "-"}
        </Typography>

        <Button
          size="small"
          sx={{ mt: 2 }}
          endIcon={<ExpandMoreIcon />}
          onClick={() => navigate(`/view-stability/${item.ID}`)}
        >
          View
        </Button>
      </CardContent>
    </Card>
  );
};

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fb", width: "100%", boxSizing: "border-box" }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Total samples loaded: {samples.length} | Stability checklist loaded: {stabilityItems.length}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={() => setOpenAddSampleDialog(true)}> + ADD SAMPLE </Button>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate("/add-stability")}>Add Stability Check</Button>
        <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>Filter</Button>
        <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
          {["All", "Completed", "In progress"].map((status) => (
            <MenuItem key={status} selected={statusFilter === status} onClick={() => {
              setStatusFilter(status as typeof statusFilter);
              setAnchorEl(null);
            }}>{status}</MenuItem>
          ))}
        </Menu>
        <TextField variant="outlined" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." sx={{ flexGrow: 1, minWidth: "220px" }} />
      </Stack>

      {/* 🧪 Samples */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <ScienceIcon sx={{ mr: 1, color: "#0288d1", fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0288d1" }}>
            Laboratory Samples
          </Typography>
        </Box>
        {filteredSamples.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center", py: 4, color: "#666" }}>
            No samples found matching your criteria
          </Typography>
        ) : (
          <Box sx={{
            display: "grid", gap: 3, width: "100%",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }
          }}>
            {filteredSamples.map(renderSampleCard)}
          </Box>
        )}
      </Paper>

      {/* 📋 Stability */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <AssignmentIcon sx={{ mr: 1, color: "#0288d1", fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0288d1" }}>
            Stability Checklist
          </Typography>
        </Box>
        {filteredStabilityItems.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center", py: 4, color: "#666" }}>
            No stability checks found matching your criteria
          </Typography>
        ) : (
          <Box sx={{
            display: "grid", gap: 3, width: "100%",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }
          }}>
            {filteredStabilityItems.map(renderStabilityCard)}
          </Box>
        )}
      </Paper>

      <AddSample
        open={openAddSampleDialog}
        onClose={() => setOpenAddSampleDialog(false)}
        onSuccess={() => {
          setOpenAddSampleDialog(false);
          fetchSamples(); 
        }}
      />
    </Box>
  );
};

export default SamplesDashboard;
