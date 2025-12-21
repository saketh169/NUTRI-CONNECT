import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

import AdminHome from '../pages/HomePages/AdminHome';
import AdminDashboard from '../pages/Dashboards/Admin';
import AdminManagement from '../pages/Admin/AdminManagement';
import OrgVerify from '../pages/Verify/OrgVeify'; 
import Analytics from '../pages/Admin/Analytics';
import AdminQueries from '../pages/Admin/AdminQueries';
import AdminSettings from '../pages/Admin/AdminSettings';

import ChangePassword from '../pages/ChangePassword';
import EditProfile from '../pages/EditProfile';


export default function AdminRoutes() {
  return (
    <AuthProvider currentRole="admin">
      <div className="p-6">
        <Routes>
          <Route index element={<Navigate to="home" replace />} />

          {/* All routes are automatically protected by ProtectedProvider in Layout.jsx */}
          <Route path="home" element={<AdminHome />} />
          <Route path="profile" element={<AdminDashboard />} />
          <Route path="users" element={<AdminManagement />} />
          <Route path="analytics" element={<Analytics/>} />
          <Route path="verify-organizations" element={<OrgVerify />} /> 
          <Route path="queries" element={<AdminQueries />} />
          <Route path="settings" element={<AdminSettings />} />
          
          <Route path="change-pass" element={<ChangePassword />} />
          <Route path="edit-profile" element={<EditProfile />} />

          
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}