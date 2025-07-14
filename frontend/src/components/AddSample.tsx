// 📁 components/AddSample.tsx

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSample = ({ open, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    id: "",
    dateOfReceipt: dayjs().format("YYYY-MM-DD"),
    clexioNumber: "",
    sampleName: "",
    containers: 1,
    testsRequired: false,
    machineMade: "",
    projectName: "",
    receivedFrom: "",
    storage: "",
    receivedBy: "",
    comment: "",
  });

  const [machineOptions, setMachineOptions] = useState<string[]>([]);
  const [storageOptions, setStorageOptions] = useState<string[]>([]);
  const [receivedByOptions, setReceivedByOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    const isString = (val: any): val is string =>
      typeof val === "string" && val.trim() !== "";

    const fetchData = async () => {
      try {
        const idRes = await axios.get("http://localhost:3000/api/Samples/next-id");
        const machinesRes = await axios.get("http://localhost:3000/api/machines/all");
        const samplesRes = await axios.get("http://localhost:3000/api/Samples/all");
        const usersRes = await axios.get("http://localhost:3000/api/users");

        setFormData((prev) => ({ ...prev, id: idRes.data }));

        const machines: string[] = machinesRes.data
          .map((m: any) => m["Instrument ID"])
          .filter(isString);

        const storage: string[] = Array.from(
          new Set(
            samplesRes.data
              .map((s: any) => s.storage)
              .filter(isString)
          )
        );

        const users: string[] = usersRes.data
          .map((u: any) => u.Username)
          .filter(isString);

        setMachineOptions(machines);
        setStorageOptions(storage);
        setReceivedByOptions(users);
      } catch (error) {
        console.error("Error loading data", error);
      }
    };

    fetchData();
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestsRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "Yes";
    setFormData((prev) => ({ ...prev, testsRequired: val }));
  };

  const handleSave = async () => {
    const payload = {
      ID: formData.id,
      "Date Of Receipt": formData.dateOfReceipt,
      "clexio Number": formData.clexioNumber,
      "Sample Name": formData.sampleName,
      Containers: formData.containers,
      "Tests Required": formData.testsRequired,
      "Machine Made": formData.machineMade,
      "Project Name": formData.projectName,
      "Received From": formData.receivedFrom,
      Storage: formData.storage,
      "Received By": formData.receivedBy,
      Comment: formData.comment,
    };

    try {
      await axios.post("http://localhost:3000/api/Samples", payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Failed to save sample:", err);
      alert("⚠️ Failed to add sample");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Sample</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="ID (Auto)" value={formData.id} disabled fullWidth />

          <TextField
            label="Date Of Receipt"
            type="date"
            value={formData.dateOfReceipt}
            onChange={(e) => setFormData({ ...formData, dateOfReceipt: e.target.value })}
            fullWidth
          />

          <TextField 
            label="Clexio Number" 
            name="clexioNumber" 
            value={formData.clexioNumber} 
            onChange={handleChange} 
            fullWidth 
          />

          <TextField 
            label="Sample Name" 
            name="sampleName" 
            value={formData.sampleName} 
            onChange={handleChange} 
            fullWidth 
          />

          <TextField
            label="Containers"
            name="containers"
            type="number"
            InputProps={{ inputProps: { min: 1 } }}
            value={formData.containers}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Tests Required"
            select
            value={formData.testsRequired ? "Yes" : "No"}
            onChange={handleTestsRequiredChange}
            fullWidth
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </TextField>

          <TextField
            label="Machine Made"
            name="machineMade"
            select
            value={formData.machineMade}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">
              <em>Select a machine</em>
            </MenuItem>
            {machineOptions.map((id) => (
              <MenuItem key={id} value={id}>{id}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Project Name"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            fullWidth
          />

          <TextField 
            label="Received From" 
            name="receivedFrom" 
            value={formData.receivedFrom} 
            onChange={handleChange} 
            fullWidth 
          />

          <TextField
            label="Storage"
            name="storage"
            select
            value={formData.storage}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">
              <em>Select storage location</em>
            </MenuItem>
            {storageOptions.map((val) => (
              <MenuItem key={val} value={val}>{val}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Received By"
            name="receivedBy"
            select
            value={formData.receivedBy}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">
              <em>Select a user</em>
            </MenuItem>
            {receivedByOptions.map((user) => (
              <MenuItem key={user} value={user}>{user}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSample;
