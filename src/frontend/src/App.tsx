import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import ModelsPage from "./pages/ModelsPage";
import ModelDetailPage from "./pages/ModelDetailPage";
import EndpointsPage from "./pages/EndpointsPage";
import EndpointDetailPage from "./pages/EndpointDetailPage";

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/models/:id" element={<ModelDetailPage />} />
        <Route path="/endpoints" element={<EndpointsPage />} />
        <Route path="/endpoints/:id" element={<EndpointDetailPage />} />
      </Routes>
    </MainLayout>
  );
}
