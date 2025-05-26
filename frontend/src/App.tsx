
import HomePage from "./components/HomePage";
import MachinesDashboard from "./pages/MachinesDashboard";
import ProductsDashboard from "./pages/ProductsDashboard";
import MaterialsDashboard from "./pages/MaterialsDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/materials" element={<MaterialsDashboard />} />
        <Route path="/machines" element={<MachinesDashboard />} />
        <Route path="/products" element={<ProductsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
