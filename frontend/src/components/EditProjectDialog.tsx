// 📁 frontend/src/components/EditProjectDialog.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem
} from "@mui/material";

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  teamMembers: number;
  progress: number;
  budget?: number;
  manager: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (updated: Project) => void;
}

const EditProjectDialog: React.FC<Props> = ({ open, onClose, project, onSave }) => {
  const [formData, setFormData] = useState<Project | null>(null);

  useEffect(() => {
    if (project) setFormData(project);
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Project Name" name="name" value={formData.name} onChange={handleChange} fullWidth />
          <TextField label="Manager" name="manager" value={formData.manager} onChange={handleChange} fullWidth />
          <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline />
          <TextField label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="End Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Status" name="status" value={formData.status} onChange={handleChange} fullWidth select>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="On Hold">On Hold</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField label="Priority" name="priority" value={formData.priority} onChange={handleChange} fullWidth select>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </TextField>
          <TextField label="Team Members" name="teamMembers" type="number" value={formData.teamMembers} onChange={handleChange} fullWidth />
          <TextField label="Progress (%)" name="progress" type="number" value={formData.progress} onChange={handleChange} fullWidth />
          <TextField label="Budget" name="budget" type="number" value={formData.budget} onChange={handleChange} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectDialog;
