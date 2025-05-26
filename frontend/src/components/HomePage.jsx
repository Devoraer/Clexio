
// HomePage – Main Dashboard for Clexio      

import { useNavigate } from "react-router-dom";
import ScienceIcon from '@mui/icons-material/Science';
import InventoryIcon from '@mui/icons-material/Inventory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { Box, Card, CardActionArea, CardContent, Typography, Grid } from "@mui/material";


export default function HomePage() {
    
    const navigate = useNavigate();

    const cards = [
        {
            title: "Materials",
            description: "View all lab materials and expiration dates",
            icon: <ScienceIcon fontSize="large" color="primary" />,
            route: "/materials"
        },
        {
            title: "Products",
            description: "Explore all products and their testing process",
            icon: <InventoryIcon fontSize="large" color="secondary" />,
            route: "/products"
        },
        {
            title: "Machines",
            description: "Manage lab machines and calibration logs",
            icon: <PrecisionManufacturingIcon fontSize="large" color="action" />,
            route: "/machines"
        }
    ];

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h3" textAlign="center" gutterBottom>
                 Welcome to Clexio Lab System
            </Typography>

            <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardActionArea onClick={() => navigate(card.route)}>
                                <CardContent sx={{ textAlign: "center" }}>
                                    <Box mb={2}>{card.icon}</Box>
                                    <Typography variant="h5" gutterBottom>{card.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">{card.description}</Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
