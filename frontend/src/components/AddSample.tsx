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
  Autocomplete,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
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
    MachineMade: "",
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

    setFormData({
      id: "",
      dateOfReceipt: dayjs().format("YYYY-MM-DD"),
      clexioNumber: "",
      sampleName: "",
      containers: 1,
      testsRequired: false,
      MachineMade: "",
      projectName: "",
      receivedFrom: "",
      storage: "",
      receivedBy: "",
      comment: "",
    });

    const isString = (val: any): val is string =>
      typeof val === "string" && val.trim() !== "";

    const generateClexioNumber = (): string => {
      const random = Math.floor(100 + Math.random() * 900);
      return `25-${random}`;
    };

    const fetchData = async () => {
      try {
        const [idRes, machinesRes, samplesRes] = await Promise.all([
          axios.get("http://localhost:3000/api/Samples/preview-id"),
          axios.get("http://localhost:3000/api/machines/all"),
          axios.get("http://localhost:3000/api/Samples/all"),
        ]);

        const id = parseInt(idRes.data);

        const machines: string[] = Array.from(
          new Set(
            machinesRes.data
              .map((m: any) => m["Instrument ID"])
              .filter((val): val is string => typeof val === "string" && val.trim() !== "")
          )
        );

        const storage: string[] = Array.from(
          new Set(samplesRes.data.map((s: any) => s.storage).filter(isString))
        );

        setFormData((prev) => ({
          ...prev,
          id: id.toString(),
          clexioNumber: generateClexioNumber(),
        }));

        setMachineOptions(machines);
        setStorageOptions(storage);
        setReceivedByOptions([]); // לשדרוג עתידי
      } catch (error) {
        console.error("❌ Error loading data", error);
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
      clexioNumber: formData.clexioNumber,
      comment: formData.comment,
      completedBy: "",
      completionDate: "",
      containers: formData.containers,
      dateOfReceipt: formData.dateOfReceipt,
      projectName: formData.projectName,
      receivedBy: formData.receivedBy,
      receivedFrom: formData.receivedFrom,
      sampleName: formData.sampleName,
      storage: formData.storage,
      testsRequired: formData.testsRequired,
      MachineMade: formData.MachineMade,
    };

    try {
      await axios.post("http://localhost:3000/api/Samples", payload);
      onSuccess();
      onClose();

      setFormData({
        id: "",
        dateOfReceipt: dayjs().format("YYYY-MM-DD"),
        clexioNumber: "",
        sampleName: "",
        containers: 1,
        testsRequired: false,
        MachineMade: "",
        projectName: "",
        receivedFrom: "",
        storage: "",
        receivedBy: "",
        comment: "",
      });
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
            onChange={(e) =>
              setFormData({ ...formData, dateOfReceipt: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Clexio Number"
            name="clexioNumber"
            value={formData.clexioNumber}
            onChange={handleChange}
            fullWidth
            disabled
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

          {/* Machine Made */}
          <Autocomplete
            freeSolo
            disableClearable
            popupIcon={<ArrowDropDownIcon />}
            options={machineOptions}
            value={formData.MachineMade}
            getOptionLabel={(option) => option}
            onChange={(_, newValue) =>
              setFormData((prev) => ({ ...prev, MachineMade: newValue }))
            }
            onInputChange={(_, newInputValue) =>
              setFormData((prev) => ({ ...prev, MachineMade: newInputValue }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Machine Made"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      <ArrowDropDownIcon />
                    </>
                  ),
                }}
              />
            )}
            PopperProps={{
              modifiers: [
                { name: "preventOverflow", options: { boundary: "viewport" } },
                { name: "flip", enabled: false },
                { name: "offset", options: { offset: [0, 4] } },
              ],
              placement: "bottom-start",
            }}
          />

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

          {/* Storage */}
          <Autocomplete
            freeSolo
            disableClearable
            popupIcon={<ArrowDropDownIcon />}
            options={storageOptions}
            value={formData.storage}
            getOptionLabel={(option) => option}
            onChange={(_, newValue) =>
              setFormData((prev) => ({ ...prev, storage: newValue }))
            }
            onInputChange={(_, newInputValue) =>
              setFormData((prev) => ({ ...prev, storage: newInputValue }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Storage"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      <ArrowDropDownIcon />
                    </>
                  ),
                }}
              />
            )}
            PopperProps={{
              modifiers: [
                { name: "preventOverflow", options: { boundary: "viewport" } },
                { name: "flip", enabled: false },
                { name: "offset", options: { offset: [0, 4] } },
              ],
              placement: "bottom-start",
            }}
          />

          <TextField
            label="Received By"
            name="receivedBy"
            value={formData.receivedBy}
            onChange={handleChange}
            fullWidth
          />

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
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSample;
