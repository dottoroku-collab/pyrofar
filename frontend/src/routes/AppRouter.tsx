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
import PemeliharaanList from "@/pages/pemeliharaan/PemeliharaanList";
import Laporan from "@/pages/laporan/Laporan";
import AuditLog from "@/pages/audit-log/AuditLog";
import Pengguna from "@/pages/pengguna/Pengguna";
import PublicArmadaPage from "@/pages/public/PublicArmada";
import Pengaturan from "@/pages/pengaturan/Pengaturan";
import { useAuthStore } from "@/store/authStore";
import { useLicense } from "@/hooks/useLicense";
import { Spin } from "antd";

function RequireAuth({ children }: { children: JSX.Element }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
}

// FeatureRoute guard – checks license feature before rendering child component
function FeatureRoute({ feature, children }: { feature: string; children: JSX.Element }) {
  const { isActive, hasFeature, loading } = useLicense();
  if (loading) {
    return <Spin tip="Memuat lisensi..." />;
  }
  if (!isActive || !hasFeature(feature)) {
    return <div>Fitur ini tidak tersedia pada lisensi Anda.</div>;
  }
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
        <Route path="/dashboard" element={<FeatureRoute feature="dashboard"><Dashboard /></FeatureRoute>} />
        <Route path="/armada" element={<FeatureRoute feature="armada"><ArmadaList /></FeatureRoute>} />
        <Route path="/armada/new" element={<FeatureRoute feature="armada"><ArmadaForm /></FeatureRoute>} />
        <Route path="/armada/:id" element={<FeatureRoute feature="armada"><ArmadaDetail /></FeatureRoute>} />
        <Route path="/armada/:id/edit" element={<FeatureRoute feature="armada"><ArmadaForm /></FeatureRoute>} />
        <Route path="/master-data" element={<MasterData />} />
        <Route path="/approval" element={<FeatureRoute feature="approval"><ApprovalList /></FeatureRoute>} />
        <Route path="/pemeliharaan" element={<FeatureRoute feature="pemeliharaan"><PemeliharaanList /></FeatureRoute>} />
        <Route path="/pemeliharaan/new" element={<FeatureRoute feature="pemeliharaan"><PemeliharaanForm /></FeatureRoute>} />
        <Route path="/laporan" element={<FeatureRoute feature="laporan"><Laporan /></FeatureRoute>} />
        <Route path="/audit-log" element={<FeatureRoute feature="audit_log"><AuditLog /></FeatureRoute>} />
        <Route path="/pengguna" element={<Pengguna />} />
        <Route path="/pengaturan" element={<Pengaturan />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
