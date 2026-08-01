import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Alerts from "../pages/Alerts";
import DiseasePrediction from "../pages/DiseasePrediction";
import MedicineStock from "../pages/MedicineStock";
import History from "../pages/History";
import NotFound from "../pages/NotFound";
import Patients from "../pages/Patients";
import Reports from "../pages/Reports";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/predict" element={<DiseasePrediction />} />
      <Route path="/medicine" element={<MedicineStock />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/history" element={<History />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default AppRoutes;
