import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import ArmadaDetail from "@/pages/armada/ArmadaDetail";
import ArmadaForm from "@/pages/armada/ArmadaForm";
import ArmadaList from "@/pages/armada/ArmadaList";
import MasterData from "@/pages/master-data/MasterData";
import ApprovalList from "@/pages/approval/ApprovalList";
import PemeliharaanForm from "@/pages/pemeliharaan/PemeliharaanForm";
import Laporan from "@/pages/laporan/Laporan";
import AuditLog from "@/pages/audit-log/AuditLog";
import Pengguna from "@/pages/pengguna/Pengguna";
import PublicArmadaPage from "@/pages/public/PublicArmada";
import { useAuthStore } from "@/store/authStore";

function RequireAuth({ children }: { children: JSX.Element }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/public/armada/:qrCodeValue" element={<PublicArmadaPage />} />

      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/armada" element={<ArmadaList />} />
        <Route path="/armada/new" element={<ArmadaForm />} />
        <Route path="/armada/:id" element={<ArmadaDetail />} />
        <Route path="/armada/:id/edit" element={<ArmadaForm />} />
        <Route path="/master-data" element={<MasterData />} />
        <Route path="/approval" element={<ApprovalList />} />
        <Route path="/pemeliharaan/new" element={<PemeliharaanForm />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/pengguna" element={<Pengguna />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
