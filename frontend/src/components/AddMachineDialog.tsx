// 📁 components/AddMachineDialog.tsx

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
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const generateRandomSuffix = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const AddMachineDialog = ({ open, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState<any>({
    id: "",
    calibrationDate: dayjs().format("YYYY-MM-DD"),
    instrumentId: "",
    calibrationInterval: "12M",
    department: "",
    location: "",
    instrumentType: "",
    calibratedBy: "",
  });

  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // 📥 שליפת ID חדש מהשרת
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/machines/next-id");
        setFormData((prev: any) => ({ ...prev, id: res.data }));
      } catch (err) {
        console.error("❌ Failed to fetch next machine ID:", err);
      }
    };

    const fetchLocations = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/machines/all");
        const uniqueLocations = Array.from(
          new Set(res.data.map((m: any) => m.Location).filter(Boolean))
        );
        setAvailableLocations(uniqueLocations);
      } catch (err) {
        console.error("❌ Failed to fetch locations:", err);
      }
    };

    if (open) {
      fetchNextId();
      fetchLocations();
    }
  }, [open]);

  // 🧠 עדכון שדה רגיל
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (field === "instrumentId") {
      const suffix = generateRandomSuffix();
      setFormData({
        ...formData,
        instrumentId: value,
        instrumentType: `${value} ${suffix}`,
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // 🧠 עדכון select
  const handleSelectChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ID: formData.id,
        "Calibration Date": formData.calibrationDate,
        "Instrument ID": formData.instrumentId,
        "Calibration interval": formData.calibrationInterval,
        Department: formData.department,
        Location: formData.location,
        "Instrument Type": formData.instrumentType,
        "Calibrated By": formData.calibratedBy,
      };

      console.log("📤 Sending machine data:", payload);

      await axios.post("http://localhost:3000/api/machines", payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Failed to save machine", error);
      alert("שמירה נכשלה 😢");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🧪 Add New Machine</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="ID (Auto)" value={formData.id} disabled fullWidth />

          <TextField
            label="Calibration Date"
            type="date"
            value={formData.calibrationDate}
            onChange={handleChange("calibrationDate")}
            fullWidth
          />

          <TextField
            label="Instrument ID"
            value={formData.instrumentId}
            onChange={handleChange("instrumentId")}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Calibration Interval</InputLabel>
            <Select
              label="Calibration Interval"
              value={formData.calibrationInterval}
              onChange={handleSelectChange("calibrationInterval")}
            >
              <MenuItem value="12M">12M</MenuItem>
              <MenuItem value="24M">24M</MenuItem>
              <MenuItem value="36M">36M</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Department"
            value={formData.department}
            onChange={handleChange("department")}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              label="Location"
              value={formData.location}
              onChange={handleSelectChange("location")}
            >
              {availableLocations.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Instrument Type"
            value={formData.instrumentType}
            disabled
            fullWidth
          />

          <TextField
            label="Calibrated By"
            value={formData.calibratedBy}
            onChange={handleChange("calibratedBy")}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">ביטול</Button>
        <Button onClick={handleSave} variant="contained">שמור</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMachineDialog;
