// ✅ SamplesDashboard.tsx
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
//import AddSample from "../components/AddSample"; // במידה ויש לך קומפוננטה כזו
import axios from "axios";

interface Sample {
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

const SamplesDashboard = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<"All" | "Valid" | "Expiring Soon" | "Expired">("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const fetchSamples = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/samples");
      const mapped: Sample[] = response.data.map((item: any) => ({
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
      setSamples(mapped);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    fetchSamples();
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

  const filteredSamples = samples
    .filter((sample) => {
      const status = checkExpiryStatus(sample.expirationDate).status;
      return expiryFilter === "All" || status === expiryFilter;
    })
    .filter((sample) => sample.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aWeight = checkExpiryStatus(a.expirationDate).weight;
      const bWeight = checkExpiryStatus(b.expirationDate).weight;
      return aWeight - bWeight;
    });

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fb", width: "100%", boxSizing: "border-box" }}>
      <Typography variant="h4" gutterBottom>
        Samples Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Total samples loaded: {samples.length}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={fetchSamples}>
          Refresh
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
          placeholder="Search samples..."
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
        {filteredSamples.map((sample) => {
          const expiry = checkExpiryStatus(sample.expirationDate);
          return (
            <Card key={sample.ID} sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ mb: 1 }}>
                  <Chip label={expiry.status} color={expiry.color as any} sx={{ mb: 1 }} />
                  <Typography variant="h6" sx={{ color: "#0288d1", fontWeight: "bold", minHeight: "56px" }}>
                    {sample.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography>ID: {sample.ID}</Typography>
                  <Typography>
                    Amount: {sample.amount} {sample.unit}
                  </Typography>
                  <Typography>Expiry Date: {sample.expirationDate}</Typography>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    endIcon={<ExpandMoreIcon />}
                    onClick={() => {
                      setSelectedSample(sample);
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

      {selectedSample && (
        <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
          <DialogTitle>{selectedSample.name}</DialogTitle>
          <DialogContent dividers>
            <Typography>ID: {selectedSample.ID}</Typography>
            <Typography>
              Amount: {selectedSample.amount} {selectedSample.unit}
            </Typography>
            <Typography>Expiry Date: {selectedSample.expirationDate}</Typography>
            <Typography>Classification: {selectedSample.classification}</Typography>
            {selectedSample.location && <Typography>Location: {selectedSample.location}</Typography>}
            {selectedSample.lot && <Typography>Lot: {selectedSample.lot}</Typography>}
            {selectedSample.vendor && <Typography>Vendor: {selectedSample.vendor}</Typography>}
            {selectedSample.casNumber && <Typography>CAS Number: {selectedSample.casNumber}</Typography>}
            {selectedSample.msds && <Typography>MSDS: {selectedSample.msds}</Typography>}
            {selectedSample.coa && <Typography>CoA: {selectedSample.coa}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* אם את רוצה להוסיף קומפוננטת AddSample – תשאירי כאן */}
      {/* <AddSample onSampleAdded={fetchSamples} /> */}
    </Box>
  );
};

export default SamplesDashboard;
