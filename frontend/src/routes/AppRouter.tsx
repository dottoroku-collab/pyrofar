import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import DashboardOperasi from "@/pages/incidents/DashboardOperasi";
import DashboardPencegahan from "@/pages/inspections/DashboardPencegahan";
import DashboardSarpras from "@/pages/sarpras/DashboardSarpras";

import Notifications from "@/pages/notifications/Notifications";
import Profile from "@/pages/profile/Profile";

import ArmadaDetail from "@/pages/armada/ArmadaDetail";
import ArmadaForm from "@/pages/armada/ArmadaForm";
import ArmadaList from "@/pages/armada/ArmadaList";
import MasterData from "@/pages/master-data/MasterData";
import ApprovalList from "@/pages/approval/ApprovalList";

import PemeliharaanForm from "@/pages/maintenance/PemeliharaanForm";
import PemeliharaanList from "@/pages/maintenance/PemeliharaanList";
import PemeliharaanDetail from "@/pages/maintenance/PemeliharaanDetail";

import Laporan from "@/pages/reports/Laporan";
import AuditLog from "@/pages/audit-log/AuditLog";
import Pengguna from "@/pages/users/Pengguna";
import PublicArmadaPage from "@/pages/public/PublicArmada";
import PublicLaporInsiden from "@/pages/public/PublicLaporInsiden";
import Pengaturan from "@/pages/settings/Pengaturan";

import InsidenList from "@/pages/incidents/InsidenList";
import InsidenDetail from "@/pages/incidents/InsidenDetail";
import InsidenForm from "@/pages/incidents/InsidenForm";

import PencegahanList from "@/pages/inspections/PencegahanList";
import PencegahanDetail from "@/pages/inspections/PencegahanDetail";
import PencegahanForm from "@/pages/inspections/PencegahanForm";
import Buildings from "@/pages/inspections/Buildings";
import Certificates from "@/pages/inspections/Certificates";

import RescueList from "@/pages/rescue/RescueList";
import RescueForm from "@/pages/rescue/RescueForm";
import RescueDetail from "@/pages/rescue/RescueDetail";

import OrganizationList from "@/pages/operations/OrganizationList";
import PersonnelList from "@/pages/operations/PersonnelList";
import OperatorList from "@/pages/operations/OperatorList";
import OperatorDetail from "@/pages/operations/OperatorDetail";

import EdukasiList from "@/pages/education/EdukasiList";
import EdukasiForm from "@/pages/education/EdukasiForm";
import EdukasiDetail from "@/pages/education/EdukasiDetail";

import SaranaList from "@/pages/sarpras/SaranaList";
import Equipment from "@/pages/sarpras/Equipment";
import Assets from "@/pages/sarpras/Assets";
import Stations from "@/pages/sarpras/Stations";
import Inventory from "@/pages/sarpras/Inventory";

import RelawanDashboard from "@/pages/relawan/RelawanDashboard";
import RelawanList from "@/pages/relawan/RelawanList";
import KomunitasForm from "@/pages/relawan/KomunitasForm";
import PelaporanList from "@/pages/relawan/PelaporanList";
import RelawanProfile from "@/pages/relawan/RelawanProfile";
import RelawanForm from "@/pages/relawan/RelawanForm";
import Training from "@/pages/relawan/Training";
import Communities from "@/pages/relawan/Communities";

import Analytics from "@/pages/analytics/Analytics";

import RolesPermissions from "@/pages/settings/RolesPermissions";
import Subscription from "@/pages/settings/Subscription";
import { useAuthStore } from "@/store/authStore";
import { useLicense } from "@/hooks/useLicense";
import { Spin } from "antd";

import TenantsDashboard from "@/pages/superadmin/TenantsDashboard";
import GlobalUsers from "@/pages/superadmin/GlobalUsers";

function RequireAuth({ children }: { children: JSX.Element }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
}

function SuperadminRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  if (!user?.is_superadmin) {
    return <Navigate to="/dashboard" replace />;
  }
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
      {/* Auth & Public */}
      <Route path="/login" element={<Login />} />
      {/* Public Pages */}
      <Route path="/public/armada/:qrCodeValue" element={<PublicArmadaPage />} />
      <Route path="/lapor-kebakaran/:tenantId" element={<PublicLaporInsiden jenis="pemadaman" />} />
      <Route path="/lapor-penyelamatan/:tenantId" element={<PublicLaporInsiden jenis="penyelamatan" />} />

      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        {/* CORE */}
        <Route path="/dashboard" element={<FeatureRoute feature="dashboard"><Dashboard /></FeatureRoute>} />
        
        {/* Module Specific Dashboards */}
        <Route path="/dashboard/operasi" element={<DashboardOperasi />} />
        <Route path="/dashboard/pencegahan" element={<DashboardPencegahan />} />
        <Route path="/dashboard/sarpras" element={<FeatureRoute feature="dashboard"><DashboardSarpras /></FeatureRoute>} />


        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        {/* OPERATIONS: Incidents & Rescue */}
        <Route path="/incidents" element={<InsidenList />} />
        <Route path="/incidents/new" element={<InsidenForm onSuccess={() => {}} onCancel={() => {}} defaultJenis="pemadaman" />} />
        <Route path="/incidents/:id" element={<InsidenDetail />} />
        <Route path="/incidents/:id/edit" element={<InsidenForm onSuccess={() => {}} onCancel={() => {}} defaultJenis="pemadaman" />} />

        <Route path="/rescue" element={<InsidenList />} />
        <Route path="/rescue/new" element={<InsidenForm onSuccess={() => {}} onCancel={() => {}} defaultJenis="penyelamatan" />} />
        <Route path="/rescue/:id" element={<InsidenDetail />} />

        {/* OPERATIONS: Personnel & Org Structure */}
        <Route path="/organizations" element={<OrganizationList />} />
        <Route path="/personnel" element={<PersonnelList />} />
        
        <Route path="/operators" element={<OperatorList />} />
        <Route path="/operators/:id" element={<OperatorDetail />} />

        {/* PREVENTION: Inspections, Buildings, Education, Certificates */}
        <Route path="/inspections" element={<PencegahanList />} />
        <Route path="/inspections/new" element={<PencegahanForm />} />
        <Route path="/inspections/:id" element={<PencegahanDetail />} />
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/education" element={<EdukasiList />} />
        <Route path="/education/new" element={<EdukasiForm />} />
        <Route path="/education/:id" element={<EdukasiDetail />} />
        <Route path="/certificates" element={<Certificates />} />

        {/* SARPRAS: Armada, Maintenance, Equipment, Assets, Stations, Inventory */}
        <Route path="/armada" element={<FeatureRoute feature="armada"><ArmadaList /></FeatureRoute>} />
        <Route path="/armada/new" element={<FeatureRoute feature="armada"><ArmadaForm /></FeatureRoute>} />
        <Route path="/armada/:id" element={<FeatureRoute feature="armada"><ArmadaDetail /></FeatureRoute>} />
        <Route path="/armada/:id/edit" element={<FeatureRoute feature="armada"><ArmadaForm /></FeatureRoute>} />
        
        <Route path="/maintenance" element={<FeatureRoute feature="pemeliharaan"><PemeliharaanList /></FeatureRoute>} />
        <Route path="/maintenance/new" element={<FeatureRoute feature="pemeliharaan"><PemeliharaanForm /></FeatureRoute>} />
        <Route path="/maintenance/:id" element={<FeatureRoute feature="pemeliharaan"><PemeliharaanDetail /></FeatureRoute>} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/inventory" element={<Inventory />} />
        
        {/* API RELAWAN */}
        <Route path="/relawan" element={<RelawanDashboard />} />
        <Route path="/relawan/relawan" element={<RelawanList />} />
        <Route path="/relawan/relawan/new" element={<RelawanForm />} />
        <Route path="/relawan/relawan/:id" element={<RelawanProfile />} />
        <Route path="/relawan/training" element={<Training />} />
        <Route path="/relawan/communities" element={<Communities />} />

        {/* ANALYTICS */}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<FeatureRoute feature="laporan"><Laporan /></FeatureRoute>} />

        {/* ADMIN */}
        <Route path="/users" element={<Pengguna />} />
        <Route path="/roles" element={<RolesPermissions />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/settings" element={<Pengaturan />} />
        <Route path="/audit-log" element={<FeatureRoute feature="audit_log"><AuditLog /></FeatureRoute>} />

        {/* SUPERADMIN */}
        <Route path="/superadmin/tenants" element={
          <SuperadminRoute>
            <TenantsDashboard />
          </SuperadminRoute>
        } />
        <Route path="/superadmin/users" element={
          <SuperadminRoute>
            <GlobalUsers />
          </SuperadminRoute>
        } />

        {/* Legacy / Shared / Others (To clean up if needed) */}
        <Route path="/master-data" element={<MasterData />} />
        <Route path="/approval" element={<FeatureRoute feature="approval"><ApprovalList /></FeatureRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
