// 📁 src/components/MainLayout.tsx
import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflow: "auto", padding: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
