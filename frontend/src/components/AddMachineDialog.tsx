import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const generateRandomSuffix = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

const AddMachineDialog = ({ open, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    id: "",
    calibrationDate: dayjs().format("YYYY-MM-DD"),
    instrumentId: "",
    calibrationInterval: "12M",
    department: "",
    location: "",
    instrumentType: "",
    calibratedBy: "",
  });

  const [options, setOptions] = useState({
    locations: [] as string[],
    departments: [] as string[],
    intervals: [] as string[],
    calibratedBy: [] as string[],
  });

  useEffect(() => {
    const fetchNextId = async () => {
      const res = await axios.get("http://localhost:3000/api/machines/next-id");
      setFormData((prev) => ({ ...prev, id: res.data }));
    };

    const fetchDropdownData = async () => {
      const res = await axios.get("http://localhost:3000/api/machines/all");
      const all = res.data;

      const getUnique = (field: string) =>
        Array.from(new Set(all.map((m: any) => m[field] || "").filter(Boolean)));

      setOptions({
        locations: getUnique("Location"),
        departments: getUnique("Department"),
        intervals: getUnique("Calibration interval"),
        calibratedBy: getUnique("Calibrated By"),
      });
    };

    if (open) {
      fetchNextId();
      fetchDropdownData();
    }
  }, [open]);

  const handleChange = (field: string) => (_: any, value: any) => {
    if (field === "instrumentId") {
      const suffix = generateRandomSuffix();
      setFormData((prev) => ({
        ...prev,
        instrumentId: value,
        instrumentType: `${value} ${suffix}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ID: formData.id,
        calibrationDate: formData.calibrationDate,
        instrumentId: formData.instrumentId,
        calibrationInterval: formData.calibrationInterval,
        department: formData.department,
        location: formData.location,
        instrumentType:
          formData.instrumentType || `${formData.instrumentId} ${generateRandomSuffix()}`,
        calibratedBy: formData.calibratedBy,
      };

      await axios.post("http://localhost:3000/api/machines", payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save machine", error);
      alert("שמירה נכשלה");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>הוספת מכונה חדשה</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="ID (Auto)" value={formData.id} disabled fullWidth />
          <TextField
            label="Calibration Date"
            type="date"
            value={formData.calibrationDate}
            onChange={(e) =>
              setFormData({ ...formData, calibrationDate: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Instrument ID"
            value={formData.instrumentId}
            onChange={(e) => handleChange("instrumentId")(e, e.target.value)}
            fullWidth
          />
          <Autocomplete
            freeSolo
            options={options.intervals}
            value={formData.calibrationInterval}
            onInputChange={handleChange("calibrationInterval")}
            renderInput={(params) => (
              <TextField {...params} label="Calibration Interval" fullWidth />
            )}
          />
          <Autocomplete
            freeSolo
            options={options.departments}
            value={formData.department}
            onInputChange={handleChange("department")}
            renderInput={(params) => (
              <TextField {...params} label="Department" fullWidth />
            )}
          />
          <Autocomplete
            freeSolo
            options={options.locations}
            value={formData.location}
            onInputChange={handleChange("location")}
            renderInput={(params) => (
              <TextField {...params} label="Location" fullWidth />
            )}
          />
          <TextField
            label="Instrument Type"
            value={formData.instrumentType}
            disabled
            fullWidth
          />
          <Autocomplete
            freeSolo
            options={options.calibratedBy}
            value={formData.calibratedBy}
            onInputChange={handleChange("calibratedBy")}
            renderInput={(params) => (
              <TextField {...params} label="Calibrated By" fullWidth />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          ביטול
        </Button>
        <Button onClick={handleSave} variant="contained">
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMachineDialog;
