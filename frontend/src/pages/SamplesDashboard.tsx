// 📁 frontend/src/components/SamplesDashboard.tsx

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
import dayjs from "dayjs";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

interface Sample {
  ID: number;
  dateOfReceipt: string;
  clexioNumber: string;
  sampleName: string;
  containers: string;
  testsRequired: boolean;
  projectName: string;
  receivedFrom: string;
  storage: string;
  receivedBy: string;
  MachineMade: string;
  comment: string | Array<{ text: string; date: string }>;
  completionDate: string;
  completedBy: string;
  comments?: Array<{
    addedBy?: string;
    text: string;
    timestamp: string;
  }>;
}

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
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showSamples, setShowSamples] = useState(false);
  const [showStability, setShowStability] = useState(false);

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
      const response = await axios.get("http://localhost:3000/api/samples/all");
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
    const completedBy = sample.completedBy;

    if (rawDate && completedBy) {
      let completion: Date | null = null;

      if (rawDate.includes("/")) {
        const [day, month, year] = rawDate.split("/").map(Number);
        completion = new Date(year, month - 1, day);
      } else if (rawDate.includes("-")) {
        const [year, month, day] = rawDate.split("-").map(Number);
        completion = new Date(year, month - 1, day);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (completion && !isNaN(completion.getTime()) && completion <= today) {
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

  const handleSaveComment = async () => {
    if (!selectedSampleId || !newComment.trim()) return;

    const comment = {
      text: newComment.trim(),
      timestamp: dayjs().toISOString(),
    };

    try {
      await axios.post(`http://localhost:3000/api/samples/${selectedSampleId}/add-comment`, comment);
      setNewComment("");
      setOpenCommentDialog(false);
      setSelectedSampleId(null);
      fetchSamples(); // ריענון
    } catch (error) {
      console.error("Failed to save comment:", error);
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
      <Card key={sample.ID} sx={{ borderRadius: 4, boxShadow: 3, width: "100%", minWidth: 260}}>
        <Box display="flex" justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={() => {
              setSelectedSampleId(sample.ID);
              setOpenCommentDialog(true);
            }}
          >
            <NoteAltIcon />
          </IconButton>
        </Box>

        <CardContent sx={{ textAlign: "left" }}>
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
                sx={{ fontSize: "0.8rem" }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={updateFields[sample.ID]?.completionDate || ""}
                onChange={(e) =>
                  setUpdateFields((prev) => ({
                    ...prev,
                    [sample.ID]: {
                      ...prev[sample.ID],
                      completionDate: e.target.value
                    }
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
                      completedBy: e.target.value
                    }
                  }))
                }
              />
              <Stack direction="row" spacing={1} mt={1}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => handleUpdate(sample.ID)}
                >
                  Complete
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  endIcon={isExpanded(sample.ID) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => toggleExpand(sample.ID)}
                >
                  {isExpanded(sample.ID) ? "Collapse" : "Expand"}
                </Button>
              </Stack>

              <Collapse in={isExpanded(sample.ID)} timeout="auto" unmountOnExit>
                <Box mt={2}>
                  <Typography variant="body2">Project Name: {sample.projectName}</Typography>
                  <Typography variant="body2">Tests Required: {sample.testsRequired === true ? "Yes" : sample.testsRequired === false ? "No" : "—"}</Typography>
                  <Typography variant="body2">Storage: {sample.storage}</Typography>
                  <Typography variant="body2">Received From: {sample.receivedFrom}</Typography>
                  <Typography variant="body2">Received By: {sample.receivedBy}</Typography>
                  <Typography variant="body2">Machine Made: {sample.MachineMade}</Typography>

                  {typeof sample.comment === "string" ? (
                    <Typography variant="body2">Comment: {sample.comment}</Typography>
                  ) : Array.isArray(sample.comment) ? (
                    <Box mt={1}>
                      <Typography variant="body2" fontWeight="bold">Comments:</Typography>
                      <ul style={{ paddingLeft: 16 }}>
                        {sample.comment.map((c, i) => (
                          <li key={i}>
                            <Typography variant="body2">
                              {c.text} <br /> {dayjs(c.date).format("YYYY-MM-DD")}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  ) : null}

                  {Array.isArray(sample.comments) && sample.comments.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="body2" fontWeight="bold">Additional Comments:</Typography>
                      <ul style={{ paddingLeft: 16 }}>
                        {sample.comments.map((c, i) => (
                          <li key={i}>
                            <Typography variant="body2">
                              {c.text}<br />👤 {c.addedBy || "Unknown"}  {dayjs(c.timestamp).format("DD/MM/YYYY HH:mm")}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}

                  <Typography variant="body2">Completed By: {sample.completedBy}</Typography>
                  <Typography variant="body2">Completion Date: {sample.completionDate}</Typography>
                </Box>
              </Collapse>
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStabilityCard = (item: any) => {
    const status = getStabilityStatus(item);
    return (
      <Card key={item.ID} sx={{ borderRadius: 4, boxShadow: 3, width: "100%", minWidth: 260}}>
        <CardContent sx={{ textAlign: "left" }}>
          <Chip label={status.status} color={status.color as any} sx={{ mb: 1 }} />
          <Typography variant="h6" sx={{ color: "#0288d1", fontWeight: "bold" }}>
            {item.stabilityName || item["Stability Name"] || "Unnamed"}
          </Typography>
          <Typography variant="body2">ID: {typeof item.ID === "object" ? JSON.stringify(item.ID) : item.ID}</Typography>
          <Typography variant="body2">Opened Date: {item.openedDate || item["Opened date"] || "-"}</Typography>
          <Typography variant="body2">Project Name: {item.projectName || item["Project name"] || "-"}</Typography>
          <Typography variant="body2">Dosage Form: {item.dosageForm || item["Dosage Form"] || "-"}</Typography>
          <Button size="small" sx={{ mt: 2 }} endIcon={<ExpandMoreIcon />} onClick={() => navigate(`/view-stability/${item.ID}`)}>View</Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fb", width: "73vw", minHeight: "100vh", boxSizing: "border-box"}}>
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

      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ScienceIcon sx={{ mr: 1, color: "#0288d1", fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0288d1" }}>
              Laboratory Samples
            </Typography>
          </Box>
          <IconButton onClick={() => setShowSamples(!showSamples)}>
            {showSamples ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={showSamples}>
          {filteredSamples.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: "center", py: 4, color: "#666" }}>
              No samples found matching your criteria
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
              {filteredSamples.map(renderSampleCard)}
            </Box>
          )}
        </Collapse>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssignmentIcon sx={{ mr: 1, color: "#0288d1", fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0288d1" }}>
              Stability Checklist
            </Typography>
          </Box>
          <IconButton onClick={() => setShowStability(!showStability)}>
            {showStability ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={showStability}>
          {filteredStabilityItems.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: "center", py: 4, color: "#666" }}>
              No stability checks found matching your criteria
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
              {filteredStabilityItems.map(renderStabilityCard)}
            </Box>
          )}
        </Collapse>
      </Paper>

      <Dialog open={openCommentDialog} onClose={() => setOpenCommentDialog(false)}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCommentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveComment}>Save</Button>
        </DialogActions>
      </Dialog>
      
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