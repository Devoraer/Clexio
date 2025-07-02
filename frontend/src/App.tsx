import LoginPage from "./pages/LoginPage"; 
import HomePage from "./components/HomePage";
import MachinesDashboard from "./pages/MachinesDashboard";
import MaterialsDashboard from "./pages/MaterialsDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FrontDashboard from "./pages/FrontDashboard";
import SamplesDashboard from "./pages/SamplesDashboard";
import AddStabilityForm from "./pages/AddStabilityForm";
import AddSample from "./components/AddSample";
import ViewStability from "./pages/ViewStability";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<FrontDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/materials" element={<MaterialsDashboard />} />
        <Route path="/machines" element={<MachinesDashboard />} />
        <Route path="/samples" element={<SamplesDashboard />} />
        <Route path="/add-stability" element={<AddStabilityForm />} />
        <Route path="/add-sample" element={<AddSample />} />
        <Route path="/view-stability/:id" element={<ViewStability />} />
      </Routes>
    </BrowserRouter>
  );
}
