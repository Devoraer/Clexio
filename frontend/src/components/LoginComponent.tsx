import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ScienceIcon from '@mui/icons-material/Science';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function LoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Simple validation
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      if (credentials.username === "admin" && credentials.password === "admin") {
        // Store login state
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", credentials.username);
        
        // Navigate to home page
        navigate("/home");
      } else {
        setError("Invalid username or password");
      }
      setLoading(false);
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            mb={3}
          >
            <Avatar 
              sx={{ 
                bgcolor: "primary.main", 
                width: 80, 
                height: 80,
                mb: 2,
                boxShadow: 3,
              }}
            >
              <ScienceIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
              Smart Lab
            </Typography>

            <Typography variant="body1" color="text.secondary">
              התחבר למערכת ניהול המעבדה
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={credentials.username}
              onChange={handleInputChange("username")}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Enter your username"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={credentials.password}
              onChange={handleInputChange("password")}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
                background: "linear-gradient(45deg, #1976d2, #1565c0)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1565c0, #0d47a1)",
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Box mt={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Demo credentials: admin / admin
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}