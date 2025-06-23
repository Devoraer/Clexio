// ✅ MaterialsDashboard.tsx – גרסה מעודכנת עם כפתורי Update + Expand יותר למעלה
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddMaterial from "../components/AddMaterial";
import axios from "axios";

interface Material {
  ID: string;
  name: string;
  amount: number;
  expirationDate: string;
  classification: string;
  unit: string;
  location?: string;
  lot?: string;
  vendor?: string;
  casNumber?: string;
  msds?: string;
  coa?: string;
}

const MaterialsDashboard = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [updateAmounts, setUpdateAmounts] = useState<{ [id: string]: string }>({});
  const [errors, setErrors] = useState<{ [id: string]: string }>({});
  const [open, setOpen] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<"All" | "Valid" | "Expiring Soon" | "Expired">("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/materials");
      const mappedMaterials: Material[] = response.data.map((item: any) => ({
        ID: item.ID,
        name: item.Tradename || item.name || "Unknown",
        amount: Number(item.Amount) || 0,
        expirationDate: item["Expiry Date"] || item.expirationDate || "Unknown",
        classification: item.No || item.classification || "Unknown",
        unit: item.Unit || "",
        location: item.Location,
        lot: item.Lot,
        vendor: item.Vendor,
        casNumber: item["CAS Number"],
        msds: item.MSDS,
        coa: item.CoA,
      }));
      setMaterials(mappedMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const checkExpiryStatus = (dateStr: string) => {
    try {
      const [day, month, year] = dateStr.split("/").map(Number);
      const expiry = new Date(year, month - 1, day);
      const now = new Date();
      const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return { status: "Expired", color: "error", weight: 2 };
      if (diffDays < 30) return { status: "Expiring Soon", color: "warning", weight: 1 };
      return { status: "Valid", color: "success", weight: 0 };
    } catch {
      return { status: "Invalid Date", color: "default", weight: 3 };
    }
  };

  const handleUpdateAmount = async (id: string, currentAmount: number) => {
    const newAmountStr = updateAmounts[id];
    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount < 0) {
      setErrors((prev) => ({ ...prev, [id]: "Enter a valid amount" }));
      return;
    }
    try {
      await axios.put(`http://localhost:3000/api/materials/${id}/amount`, {
        amount: newAmount,
      });
      setMaterials((prev) => prev.map((m) => (m.ID === id ? { ...m, amount: newAmount } : m)));
      setUpdateAmounts((prev) => ({ ...prev, [id]: "" }));
      setErrors((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("❌ Update error:", err);
    }
  };

  const filteredMaterials = materials
    .filter((mat) => {
      const status = checkExpiryStatus(mat.expirationDate).status;
      return expiryFilter === "All" || status === expiryFilter;
    })
    .filter((mat) => mat.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aWeight = checkExpiryStatus(a.expirationDate).weight;
      const bWeight = checkExpiryStatus(b.expirationDate).weight;
      return aWeight - bWeight;
    });

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fb", width: "100%", boxSizing: "border-box" }}>
      <Typography variant="h4" gutterBottom>
        Materials Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Total materials loaded: {materials.length}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Material
        </Button>

        <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>
          Filter
        </Button>
        <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
          {["All", "Valid", "Expiring Soon", "Expired"].map((status) => (
            <MenuItem
              key={status}
              selected={expiryFilter === status}
              onClick={() => {
                setExpiryFilter(status as typeof expiryFilter);
                setAnchorEl(null);
              }}
            >
              {status}
            </MenuItem>
          ))}
        </Menu>

        <TextField
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search materials..."
          sx={{ flexGrow: 1, minWidth: "220px" }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          width: "100%",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        {filteredMaterials.map((material) => {
          const expiry = checkExpiryStatus(material.expirationDate);
          return (
            <Card key={material.ID} sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ mb: 1 }}>
                  <Chip label={expiry.status} color={expiry.color as any} sx={{ mb: 1 }} />
                  <Typography variant="h6" sx={{ color: "#0288d1", fontWeight: "bold", minHeight: "56px" }}>
                    {material.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography>ID: {material.ID}</Typography>
                  <Typography>
                    Amount: {material.amount} {material.unit}
                  </Typography>
                  <Typography>Expiry Date: {material.expirationDate}</Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ justifyContent: "space-between" }}>
                  <TextField
                    label="Amount"
                    type="number"
                    size="small"
                    value={updateAmounts[material.ID] || ""}
                    onChange={(e) =>
                      setUpdateAmounts((prev) => ({ ...prev, [material.ID]: e.target.value }))
                    }
                    error={!!errors[material.ID]}
                    helperText={errors[material.ID] || ""}
                    sx={{ width: 90 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleUpdateAmount(material.ID, material.amount)}
                  >
                    Update
                  </Button>
                  <Button
                    size="small"
                    endIcon={<ExpandMoreIcon />}
                    onClick={() => {
                      setSelectedMaterial(material);
                      setShowDialog(true);
                    }}
                  >
                    Expand
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {selectedMaterial && (
        <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
          <DialogTitle>{selectedMaterial.name}</DialogTitle>
          <DialogContent dividers>
            <Typography>ID: {selectedMaterial.ID}</Typography>
            <Typography>
              Amount: {selectedMaterial.amount} {selectedMaterial.unit}
            </Typography>
            <Typography>Expiry Date: {selectedMaterial.expirationDate}</Typography>
            <Typography>Classification: {selectedMaterial.classification}</Typography>
            {selectedMaterial.location && <Typography>Location: {selectedMaterial.location}</Typography>}
            {selectedMaterial.lot && <Typography>Lot: {selectedMaterial.lot}</Typography>}
            {selectedMaterial.vendor && <Typography>Vendor: {selectedMaterial.vendor}</Typography>}
            {selectedMaterial.casNumber && <Typography>CAS Number: {selectedMaterial.casNumber}</Typography>}
            {selectedMaterial.msds && <Typography>MSDS: {selectedMaterial.msds}</Typography>}
            {selectedMaterial.coa && <Typography>CoA: {selectedMaterial.coa}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <AddMaterial onMaterialAdded={fetchMaterials} />
    </Box>
  );
};

export default MaterialsDashboard;
