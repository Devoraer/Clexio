import LoginPage from "./pages/LoginPage"; 
import HomePage from "./components/HomePage";
import MachinesDashboard from "./pages/MachinesDashboard";
import ProductsDashboard from "./pages/ProductsDashboard";
import MaterialsDashboard from "./pages/MaterialsDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FrontDashboard from "./pages/FrontDashboard";
import SamplesDashboard from "./pages/SamplesDashboard";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<FrontDashboard />} />
        {/* <Route path="/" element={<div>הגעת לעמוד הראשי!</div>} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/materials" element={<MaterialsDashboard />} />
        <Route path="/machines" element={<MachinesDashboard />} />
        <Route path="/products" element={<ProductsDashboard />} />
        <Route path="/samples" element={<SamplesDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

