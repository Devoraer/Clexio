import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "axios";

interface Material {
  ID: string;
  name: string;
  quantity: number;
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

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/materials");
        const mappedMaterials: Material[] = response.data.map((item: any) => ({
          ID: item.ID || item.id || "Unknown",
          name: item.Tradename || "Unknown",
          quantity: Number(item["Quantity "] || item.Quantity || 0),
          expirationDate: item["Expiry Date"] || "Unknown",
          classification: item.No || "Unknown",
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

  const filteredMaterials = materials
    .filter((mat) => mat.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aWeight = checkExpiryStatus(a.expirationDate).weight;
      const bWeight = checkExpiryStatus(b.expirationDate).weight;
      return aWeight - bWeight;
    });

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fb", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        🧪 Materials Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        🔢 Total materials loaded: {materials.length}
      </Typography>

      <TextField
        label="Search materials"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Grid container spacing={3}>
        {filteredMaterials.map((material) => {
          const expiry = checkExpiryStatus(material.expirationDate);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={material.ID}>
              <Card
                onClick={() => setSelectedMaterial(material)}
                sx={{
                  borderRadius: 4,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <CardContent>
                  <Chip label={expiry.status} color={expiry.color as any} />
                  <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                    {material.name}
                  </Typography>
                  <Typography>
                    📦 Quantity: {material.quantity} {material.unit}
                  </Typography>
                  <Typography>
                    ⏳ Expiry: {material.expirationDate}
                  </Typography>
                  <Typography>
                    📌 Location: {material.classification}
                  </Typography>
                  <Typography>
                    🏷️ Classification: {material.ID}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 🪟 Dialog */}
      <Dialog open={!!selectedMaterial} onClose={() => setSelectedMaterial(null)} maxWidth="sm" fullWidth>
        <DialogTitle>🧾 Material Details</DialogTitle>
        <DialogContent dividers>
          {selectedMaterial && (
            <>
              <Typography><strong>Name:</strong> {selectedMaterial.name}</Typography>
              <Typography><strong>ID:</strong> {selectedMaterial.ID}</Typography>
              <Typography><strong>Quantity:</strong> {selectedMaterial.quantity} {selectedMaterial.unit}</Typography>
              <Typography><strong>Expiry Date:</strong> {selectedMaterial.expirationDate}</Typography>
              <Typography><strong>Location:</strong> {selectedMaterial.location}</Typography>
              <Typography><strong>Classification:</strong> {selectedMaterial.classification}</Typography>
              <Typography><strong>Lot:</strong> {selectedMaterial.lot}</Typography>
              <Typography><strong>Vendor:</strong> {selectedMaterial.vendor}</Typography>
              <Typography><strong>CAS Number:</strong> {selectedMaterial.casNumber}</Typography>
              <Typography><strong>MSDS:</strong> {selectedMaterial.msds}</Typography>
              <Typography><strong>CoA:</strong> {selectedMaterial.coa}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMaterial(null)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialsDashboard;
