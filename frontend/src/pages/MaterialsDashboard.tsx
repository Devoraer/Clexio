// 📁 MaterialsDashboard.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  Collapse,
  Button,
  Stack,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useLocation } from "react-router-dom";
import axios from "axios";
import AddMaterialDialog from "../components/AddMaterialDialog";

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
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [updateAmounts, setUpdateAmounts] = useState<{ [id: string]: string }>({});
  const [errors, setErrors] = useState<{ [id: string]: string }>({});
  const [open, setOpen] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<"All" | "Valid" | "Expiring Soon" | "Expired">("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const highlightedId = params.get("highlight") ?? "";

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

  useEffect(() => {
    if (highlightedId) {
      const el = document.getElementById(`material-${highlightedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [materials, highlightedId]);

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

  const findExpiredWithValidCopies = (list: Material[]) => {
    const grouped: { [name: string]: { valid: boolean; expired: boolean } } = {};
    for (const mat of list) {
      const status = checkExpiryStatus(mat.expirationDate).status;
      const name = mat.name;
      if (!grouped[name]) grouped[name] = { valid: false, expired: false };
      if (status === "Valid" || status === "Expiring Soon") grouped[name].valid = true;
      if (status === "Expired") grouped[name].expired = true;
    }
    return Object.entries(grouped)
      .filter(([_, val]) => val.valid && val.expired)
      .map(([name]) => name);
  };

  const showDisabledList = findExpiredWithValidCopies(materials);

  const handleUpdateAmount = async (id: string, currentAmount: number) => {
    const newAmountStr = updateAmounts[id];
    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount < 0) {
      setErrors((prev) => ({ ...prev, [id]: "Enter a valid amount" }));
      return;
    }
    if (newAmount >= currentAmount) {
      setErrors((prev) => ({ ...prev, [id]: `Must be less than ${currentAmount}` }));
      return;
    }
    try {
      await axios.put(`http://localhost:3000/api/materials/${id}/amount`, { amount: newAmount });
      setMaterials((prev) => prev.map((m) => (m.ID === id ? { ...m, amount: newAmount } : m)));
      setUpdateAmounts((prev) => ({ ...prev, [id]: "" }));
      setErrors((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("❌ Update error:", err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f5f7fb",
        width: "93%",
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      <Typography variant="body1" sx={{ mb: 3, textAlign: "left" }}>
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
          label="Search materials..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 300 }}
        />
      </Stack>

      <AddMaterialDialog open={open} onClose={() => setOpen(false)} onSuccess={fetchMaterials} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          justifyItems: "center",
          maxWidth: "820px",
          margin: "0 auto",
        }}
      >
        {filteredMaterials.map((material) => {
          const expiry = checkExpiryStatus(material.expirationDate);
          const isExpanded = expandedIds.includes(material.ID);
          const isDisabled = expiry.status === "Expired" && showDisabledList.includes(material.name);
          const isHighlighted = material.ID === highlightedId;

          return (
            <Tooltip
              key={material.ID}
              title={isDisabled ? "A valid copy of this material exists. No need to use expired version." : ""}
              arrow
              placement="top"
              disableHoverListener={!isDisabled}
            >
              <Card
                id={`material-${material.ID}`}
                sx={{
                  borderRadius: 4,
                  boxShadow: 3,
                  bgcolor: "#ffffff",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  maxWidth: 260,
                  border: isHighlighted ? "3px solid #1565c0" : "none",
                  transition: "all 0.3s ease-in-out",
                  height: "100%", // 💡 חשוב: מאפשר גובה אחיד
                  ...(isDisabled && {
                    "&:hover": { cursor: "not-allowed" },
                    opacity: 0.4,
                    pointerEvents: "none",
                  }),
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "left" }}>
                  <Chip label={expiry.status} color={expiry.color as any} 
                    sx={{
                      mb: 1,
                      height: 28,
                      fontSize: "0.9rem",
                      fontWeight: "bold"
                    }}/>
                  <Typography variant="body1" 
                    sx={{
                      color: "#0288d1",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      wordBreak: "break-word",  // ✨ זה מאפשר לשמות להתפצל שורה
                      whiteSpace: "normal",     // ✨ מונע חיתוך מוקדם
                    }}>
                    {material.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem" }}>ID: {material.ID}</Typography>
                  <Typography sx={{ fontSize: "0.85rem" }}>
                    Amount: {material.amount} {material.unit}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem" }}>Expiry Date: {material.expirationDate}</Typography>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box mt={2}>
                      {material.location && <Typography sx={{ fontSize: "0.85rem" }}>Location: {material.location}</Typography>}
                      {material.lot && <Typography sx={{ fontSize: "0.85rem" }}>Lot: {material.lot}</Typography>}
                      {material.vendor && <Typography sx={{ fontSize: "0.85rem" }}>Vendor: {material.vendor}</Typography>}
                      {material.casNumber && <Typography sx={{ fontSize: "0.85rem" }}>CAS Number: {material.casNumber}</Typography>}
                      {material.msds && <Typography sx={{ fontSize: "0.85rem" }}>MSDS: {material.msds}</Typography>}
                      {material.coa && <Typography sx={{ fontSize: "0.85rem" }}>CoA: {material.coa}</Typography>}
                      <Typography sx={{ fontSize: "0.85rem" }}>No: {material.classification}</Typography>
                    </Box>
                  </Collapse>
                </CardContent>

                {/* 🧷 כאן הכפתורים תמיד בתחתית הכרטיס */}
                <Box sx={{ px: 2, pb: 2, pt: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start">
                    <TextField
                      label="Amount"
                      size="small"
                      value={updateAmounts[material.ID] || ""}
                      onChange={(e) =>
                        setUpdateAmounts((prev) => ({ ...prev, [material.ID]: e.target.value }))
                      }
                      error={!!errors[material.ID]}
                      helperText={errors[material.ID] || ""}
                      sx={{
                        width: 90,
                        "& label": { fontSize: "0.65rem" },
                        "& input": { fontSize: "0.65rem" },
                      }}
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
                      variant="outlined"
                      endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => toggleExpand(material.ID)}
                    >
                      Expand
                    </Button>
                  </Stack>
                </Box>
              </Card>

            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default MaterialsDashboard;
