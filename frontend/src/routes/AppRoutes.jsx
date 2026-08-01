import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import DiseasePrediction from "../pages/DiseasePrediction";
import PatientManagement from "../pages/PatientManagement";
import MedicineInventory from "../pages/MedicineInventory";
import Alerts from "../pages/Alerts";
import History from "../pages/History";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prediction" element={<DiseasePrediction />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/inventory" element={<MedicineInventory />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;