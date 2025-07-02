// 📁 components/AddMaterialDialog.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const unitOptions = ["ml", "gr", "kg", "L"];

const getSuggestedAmount = (unit: string): string => {
  switch (unit) {
    case "ml":
    case "gr":
      return "500";
    case "kg":
      return "5";
    case "L":
      return "3";
    default:
      return "";
  }
};

const AddMaterialDialog = ({ open, onClose, onSuccess }: Props) => {
  const initialForm = {
    ID: "",
    Tradename: "",
    Amount: "",
    Unit: "",
    Location: "",
    Lot: "",
    Vendor: "",
    "CAS Number": "",
    MSDS: "",
    CoA: "",
    No: "",
    "Expiry Date": ""
  };

  const [formData, setFormData] = useState<any>(initialForm);
  const [tradenameOptions, setTradenameOptions] = useState<string[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
          const res = await axios.get("http://localhost:3000/api/materials");
          const data = res.data;

          const idList = data.map((m: any) => Number(m.ID)).filter((id) => !isNaN(id));
          const maxId = Math.max(...idList, 0) + 1;
          const expiry = dayjs().add(6, "month").format("DD/MM/YYYY");
          const names = Array.from(new Set(data.map((m: any) => m.Tradename).filter(Boolean)));

          setFormData((prev: any) => ({
            ...prev,
            ID: maxId.toString(),
            "Expiry Date": expiry
          }));

          setTradenameOptions(names);
          setMaterials(data);
        } catch (err) {
          console.error("❌ Failed to load materials:", err);
        }
      };

      loadData();
    }
  }, [open]);

  const handleTradenameSelect = (value: string) => {
    const latest = [...materials].reverse().find((m) => m.Tradename === value);

    if (latest) {
      setFormData((prev: any) => ({
        ...prev,
        Tradename: value,
        Amount: getSuggestedAmount(latest.Unit) || latest.Amount || "",
        Unit: latest.Unit || "",
        Location: latest.Location || "",
        Lot: latest.Lot || "",
        Vendor: latest.Vendor || "",
        "CAS Number": latest["CAS Number"] || "",
        MSDS: latest.MSDS || "",
        CoA: latest.CoA || "",
        No: latest.No || ""
      }));
    } else {
      setFormData((prev: any) => ({
        ...initialForm,
        ID: prev.ID,
        "Expiry Date": prev["Expiry Date"],
        Tradename: value
      }));
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field === "Unit") {
      const suggested = getSuggestedAmount(value);
      setFormData((prev: any) => ({
        ...prev,
        Unit: value,
        Amount: suggested
      }));
    } else if (field === "Tradename") {
      const exists = tradenameOptions.includes(value);
      if (!exists) {
        setFormData((prev: any) => ({
          ...initialForm,
          ID: prev.ID,
          "Expiry Date": prev["Expiry Date"],
          Tradename: value
        }));
      } else {
        setFormData((prev: any) => ({
          ...prev,
          Tradename: value
        }));
      }
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
  };

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:3000/api/materials", formData);
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("❌ Error saving material:", error);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Material</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="ID" value={formData.ID} fullWidth disabled />

          <Autocomplete
            freeSolo
            options={tradenameOptions}
            value={formData.Tradename}
            onChange={(_, newValue) => handleTradenameSelect(newValue || "")}
            onInputChange={(_, newInputValue) => handleChange("Tradename", newInputValue)}
            renderInput={(params) => (
              <TextField {...params} label="Tradename" fullWidth />
            )}
          />

          <TextField
            label="Amount"
            value={formData.Amount}
            onChange={(e) => handleChange("Amount", e.target.value)}
            fullWidth
          />

          <TextField
            label="Unit"
            value={formData.Unit}
            onChange={(e) => handleChange("Unit", e.target.value)}
            fullWidth
            select
          >
            <MenuItem value="">Select</MenuItem>
            {unitOptions.map((unit) => (
              <MenuItem key={unit} value={unit}>{unit}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Location"
            value={formData.Location}
            onChange={(e) => handleChange("Location", e.target.value)}
            fullWidth
          />
          <TextField
            label="Lot"
            value={formData.Lot}
            onChange={(e) => handleChange("Lot", e.target.value)}
            fullWidth
          />
          <TextField
            label="Vendor"
            value={formData.Vendor}
            onChange={(e) => handleChange("Vendor", e.target.value)}
            fullWidth
          />
          <TextField
            label="CAS Number"
            value={formData["CAS Number"]}
            onChange={(e) => handleChange("CAS Number", e.target.value)}
            fullWidth
          />
          <TextField
            label="MSDS"
            value={formData.MSDS}
            onChange={(e) => handleChange("MSDS", e.target.value)}
            fullWidth
          />
          <TextField
            label="CoA"
            value={formData.CoA}
            onChange={(e) => handleChange("CoA", e.target.value)}
            fullWidth
          />
          <TextField
            label="No"
            value={formData.No}
            onChange={(e) => handleChange("No", e.target.value)}
            fullWidth
          />
          <TextField
            label="Expiry Date"
            value={formData["Expiry Date"]}
            disabled
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          ADD
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMaterialDialog;
