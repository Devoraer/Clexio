import React, { useEffect } from "react";
import axios from "axios";
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

const AddMaterial = ({ onMaterialAdded }: { onMaterialAdded: () => void }) => {
  const [open, setOpen] = React.useState(false);
  const [nextID, setNextID] = React.useState("");
  const [selectedName, setSelectedName] = React.useState("");

  const materialNames = [
    "Acetone",
    "Ethanol",
    "Sodium Chloride",
    "Hydrochloric Acid",
    "Potassium Hydroxide",
    "Other",
  ];

  const fetchNextID = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/materials/next-id");
      setNextID(res.data.nextID.toString());
    } catch (err) {
      console.error("❌ Failed to fetch next ID:", err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchNextID();
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedName("");
  };

  const handleSave = async () => {
    if (!selectedName) {
      alert("❗ Please select a material name");
      return;
    }

    const newMaterial = {
      ID: nextID,
      name: selectedName,
    };

    try {
      await axios.post("http://localhost:3000/api/materials", newMaterial);
      alert("✅ Material added successfully!");
      handleClose();
      onMaterialAdded();
    } catch (err) {
      console.error("❌ Error saving material:", err);
      alert("⚠️ Failed to add material");
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        ➕ Add Material
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>📦 Add New Material</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: "300px" }}>
            <TextField
              label="ID"
              value={nextID}
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Material Name</InputLabel>
              <Select
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                label="Material Name"
              >
                {materialNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained" color="primary">
            Add ✅
          </Button>
          <Button onClick={handleClose} color="secondary">
            Cancel ❌
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddMaterial;
