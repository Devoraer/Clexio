
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";

const AddSample = ({ onSampleAdded = () => {} }: { onSampleAdded?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [machineOptions, setMachineOptions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    sampleName: "",
    clexioNumber: "",
    projectName: "",
    dateOfReceipt: "",
    containers: "",
    receivedFrom: "",
    receivedBy: "",
    MachineMade: "",
    storage: "",
    comment: "",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      sampleName: "",
      clexioNumber: "",
      projectName: "",
      dateOfReceipt: "",
      containers: "",
      receivedFrom: "",
      receivedBy: "",
      MachineMade: "",
      storage: "",
      comment: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.sampleName || !formData.dateOfReceipt || !formData.clexioNumber) {
      alert("❗ Please fill required fields");
      return;
    }

    const payload = {
      ...formData,
      containers: Number(formData.containers),
    };

    try {
      await axios.post("http://localhost:3000/api/samples", payload);
      alert("✅ Sample added successfully!");
      handleClose();
      onSampleAdded();
    } catch (err) {
      console.error("❌ Error saving sample:", err);
      alert("⚠️ Failed to add sample");
    }
  };

  // 🔄 Load machine list
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/machines/all");
        const ids = response.data.map((m: any) => m["Instrument ID"]);
        setMachineOptions(ids);
      } catch (error) {
        console.error("❌ Failed to load machine list:", error);
      }
    };
    fetchMachines();
  }, []);

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        ➕ Add Sample
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle> Add New Sample</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField label="Sample Name" name="sampleName" value={formData.sampleName} onChange={handleChange} fullWidth required />
            <TextField label="Clexio Number" name="clexioNumber" value={formData.clexioNumber} onChange={handleChange} fullWidth />
            <TextField label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} fullWidth />
            <TextField label="Date of Receipt" name="dateOfReceipt" type="date" InputLabelProps={{ shrink: true }} value={formData.dateOfReceipt} onChange={handleChange} fullWidth />
            <TextField label="Containers" name="containers" type="number" value={formData.containers} onChange={handleChange} fullWidth />
            <TextField label="Received From" name="receivedFrom" value={formData.receivedFrom} onChange={handleChange} fullWidth />
            <TextField label="Received By" name="receivedBy" value={formData.receivedBy} onChange={handleChange} fullWidth />

            {/* ✅ Machine Made Dropdown */}
            <TextField
              label="Machine Made"
              name="MachineMade"
              select
              value={formData.MachineMade}
              onChange={handleChange}
              fullWidth
            >
              {machineOptions.map((id) => (
                <MenuItem key={id} value={id}>
                  {id}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Storage" name="storage" value={formData.storage} onChange={handleChange} fullWidth />
            <TextField label="Comment" name="comment" value={formData.comment} onChange={handleChange} fullWidth multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel 
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Add 
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddSample;