// ✅ MaterialsDashboard.tsx – with tooltip message on disabled expired cards
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

  // 🛑 בדיקה שהמספר חוקי
  if (isNaN(newAmount) || newAmount < 0) {
    setErrors((prev) => ({ ...prev, [id]: "Enter a valid amount" }));
    return;
  }

  // ❗ בדיקה שהוא קטן מהכמות הנוכחית
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
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fb", width: "100vw", overflowX: "hidden", boxSizing: "border-box" }}>
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
          label="Search materials..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 910 }}
        />
    
      </Stack>

      <AddMaterialDialog open={open} onClose={() => setOpen(false)} onSuccess={fetchMaterials} />

      <Box
        sx={{
          display: "grid",
          gap: 3,
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
          const isExpanded = expandedIds.includes(material.ID);
          const isDisabled = expiry.status === "Expired" && showDisabledList.includes(material.name);

          return (
            <Tooltip
              key={material.ID}
              title={isDisabled ? "A valid copy of this material exists. No need to use expired version." : ""}
              arrow
              placement="top"
              disableHoverListener={!isDisabled}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 3,
                  bgcolor: "#ffffff",
                  position: "relative",
                  height: "100%", // ✅ חשוב
                  display: "flex",
                  flexDirection: "column",
                  ...(isDisabled && {
                    "&:hover": { cursor: "not-allowed" },
                  }),
                }}
              >
                <Box sx={isDisabled ? { pointerEvents: "none", opacity: 0.4 } : { height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <Chip label={expiry.status} color={expiry.color as any} sx={{ mb: 1, width: 120,height: 24, justifyContent: "center" }} />
                    <Typography variant="h6" sx={{ color: "#0288d1", fontWeight: "bold" }}>
                      {material.name}
                    </Typography>
                    <Typography>ID: {material.ID}</Typography>
                    <Typography>
                      Amount: {material.amount} {material.unit}
                    </Typography>
                    <Typography>Expiry Date: {material.expirationDate}</Typography>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box mt={2}>
                        {material.location && <Typography>Location: {material.location}</Typography>}
                        {material.lot && <Typography>Lot: {material.lot}</Typography>}
                        {material.vendor && <Typography>Vendor: {material.vendor}</Typography>}
                        {material.casNumber && <Typography>CAS Number: {material.casNumber}</Typography>}
                        {material.msds && <Typography>MSDS: {material.msds}</Typography>}
                        {material.coa && <Typography>CoA: {material.coa}</Typography>}
                        <Typography>No: {material.classification}</Typography>
                      </Box>
                    </Collapse>

                    {/* ✅ זה שומר את שורת הכפתורים בתחתית */}
                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                       <TextField
                          label="Amount"
                          size="small"
                          value={updateAmounts[material.ID] || ""}
                          onChange={(e) =>
                            setUpdateAmounts((prev) => ({ ...prev, [material.ID]: e.target.value }))
                          }
                          error={!!errors[material.ID]}
                          helperText={errors[material.ID] || ""}
                          FormHelperTextProps={{
                            sx: { whiteSpace: "nowrap", fontSize: "0.75rem", marginLeft: 0 },
                          }}
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
                          variant="outlined"
                          endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          onClick={() => toggleExpand(material.ID)}
                        >
                          Expand
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
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