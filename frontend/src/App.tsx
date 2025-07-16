// 📁 App.tsx
import { HashRouter, Routes, Route } from "react-router-dom"; // 🟢 שימי לב להחלפה כאן!
import './App.css';

// ✅ עמודים
import HomePage from "./components/HomePage";
import MachinesDashboard from "./pages/MachinesDashboard";
import MaterialsDashboard from "./pages/MaterialsDashboard";
import FrontDashboard from "./pages/FrontDashboard";
import SamplesDashboard from "./pages/SamplesDashboard";
import AddStabilityForm from "./pages/AddStabilityForm";
import AddSample from "./components/AddSample";
import ViewStability from "./pages/ViewStability";
import CalendarPage from "./pages/CalendarPage";
import ProjectsPage from "./pages/ProjectsPage";

// ✅ Layout
import MainLayout from "./MainLayout";

export default function App() {
  return (
    <HashRouter> {/* 🟢 החלפנו פה */}
      <Routes>
        {/* עמוד ההתחברות מחוץ ל־Sidebar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<FrontDashboard />} />
          <Route path="/materials" element={<MaterialsDashboard />} />
          <Route path="/machines" element={<MachinesDashboard />} />
          <Route path="/samples" element={<SamplesDashboard />} />
          <Route path="/add-stability" element={<AddStabilityForm />} />
          <Route path="/add-sample" element={<AddSample />} />
          <Route path="/view-stability/:id" element={<ViewStability />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
