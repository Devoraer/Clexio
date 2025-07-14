// App.tsx

// 📦 רכיבי עמודים
// 🔐 LOGIN SECTION - START
// import LoginPage from "./pages/LoginPage"; 
// import { LoginComponent } from "./components/LoginComponent";
// 🔐 LOGIN SECTION - END

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

        {/* 🔐 LOGIN SECTION - START */}
        {/* עמוד לוגין ציבורי */}
        {/* <Route path="/" element={<LoginPage />} /> */}

        {/* מסלולים שמוגנים עם LoginComponent */}
        {/* <Route 
          path="/dashboard" 
          element={
            <LoginComponent>
              <FrontDashboard />
            </LoginComponent>
          } 
        />
        <Route 
          path="/home" 
          element={
            <LoginComponent>
              <HomePage />
            </LoginComponent>
          } 
        />
        <Route 
          path="/materials" 
          element={
            <LoginComponent>
              <MaterialsDashboard />
            </LoginComponent>
          } 
        />
        <Route 
          path="/machines" 
          element={
            <LoginComponent>
              <MachinesDashboard />
            </LoginComponent>
          } 
        />
        <Route 
          path="/samples" 
          element={
            <LoginComponent>
              <SamplesDashboard />
            </LoginComponent>
          } 
        />
        <Route 
          path="/add-stability" 
          element={
            <LoginComponent>
              <AddStabilityForm />
            </LoginComponent>
          } 
        />
        <Route 
          path="/add-sample" 
          element={
            <LoginComponent>
              <AddSample />
            </LoginComponent>
          } 
        />
        <Route 
          path="/view-stability/:id" 
          element={
            <LoginComponent>
              <ViewStability />
            </LoginComponent>
          } 
        /> */}
        {/* 🔐 LOGIN SECTION - END */}

        {/* ✅ מסלולים זמניים פתוחים בלי לוגין */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<FrontDashboard />} />
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
