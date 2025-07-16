// 📁 components/GarbageReminder.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import axios from "axios";

const GarbageReminder = () => {
  const [nextDate, setNextDate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/garbage/date")
      .then((res) => {
        setNextDate(res.data.nextDate);
        setNewDate(res.data.nextDate);
      })
      .catch((err) => console.error("❌ Error fetching garbage date:", err));
  }, []);

  const handleSave = () => {
    axios
      .put("http://localhost:3000/api/garbage/date", { nextDate: newDate })
      .then(() => {
        setNextDate(newDate);
        setDialogOpen(false);
      })
      .catch((err) => console.error("❌ Error updating garbage date:", err));
  };

  return (
    <Box
      mt={3}
      px={2}
      py={2}
      width="100%"
      maxWidth="800px"
      sx={{
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6" fontWeight="bold">
          ♻️ Garbage Disposal Date:
        </Typography>
        
        <Stack direction="row" alignItems="center" spacing={1}></Stack>
        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)", }} >
        {dayjs(nextDate, "DD/MM/YYYY").isValid() ? nextDate : "Invalid date"}
        </Typography>
      </Stack>

      <IconButton onClick={() => setDialogOpen(true)} color="primary">
        <EditIcon />
      </IconButton>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Update Garbage Disposal Date</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            fullWidth
            value={dayjs(newDate, "DD/MM/YYYY").format("YYYY-MM-DD")}
            onChange={(e) =>
              setNewDate(dayjs(e.target.value).format("DD/MM/YYYY"))
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GarbageReminder;
