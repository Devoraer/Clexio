// 📁 frontend/components/TestAddMaterial.tsx
import React from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
//import dayjs from "dayjs";

const TestAddMaterial = ({ onMaterialAdded }: { onMaterialAdded: () => void }) => {
  const [open, setOpen] = React.useState(false);
  const [newMaterial, setNewMaterial] = React.useState({
    Tradename: "",
    Quantity: "",
    "Expiry Date": "",
    Unit: "",
    Location: "",
    No: "",
    Lot: "",
    Vendor: "",
    "CAS Number": "",
    MSDS: "",
    CoA: "",
  });

  const handleChange = (field: string, value: string) => {
    setNewMaterial((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.post("http://localhost:3000/materials", newMaterial);
      console.log("✅ Added Material:", response.data);
      alert("החומר נוסף בהצלחה ✅");
      setOpen(false);
      onMaterialAdded();
    } catch (err) {
      console.error("❌ Error adding material:", err);
      alert("שגיאה בהוספת חומר ⚠️");
    }
  };

  const fields = [
    "Tradename",
    "Quantity",
    "Unit",
    "Location",
    "No",
    "Lot",
    "Vendor",
    "CAS Number",
    "MSDS",
    "CoA",
  ];

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        הוספת חומר
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>➕ הוספת חומר חדש</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: "300px" }}>
            {fields.map((field) => (
              <TextField
                key={field}
                label={field}
                value={newMaterial[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                fullWidth
              />
            ))}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Expiry Date"
                value={newMaterial["Expiry Date"] ? dayjs(newMaterial["Expiry Date"], "DD/MM/YYYY") : null}
                onChange={(date) =>
                  setNewMaterial((prev) => ({
                    ...prev,
                    "Expiry Date": dayjs(date).format("DD/MM/YYYY"),
                  }))
                }
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained">
            שמור
          </Button>
          <Button onClick={() => setOpen(false)} color="secondary">
            ביטול
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TestAddMaterial;
