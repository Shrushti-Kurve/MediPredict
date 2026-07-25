import { Navigate, Route, Routes } from "react-router-dom";

import DiseasePrediction from "../pages/DiseasePrediction";

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/predict" replace />} />
			<Route path="/predict" element={<DiseasePrediction />} />
			<Route path="*" element={<Navigate to="/predict" replace />} />
		</Routes>
	);
}

export default AppRoutes;
