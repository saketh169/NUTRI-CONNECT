import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { VerifyProvider } from '../contexts/VerifyContext';

import OrganizationHome from '../pages/HomePages/OrganizationHome';
import OrganizationDashboard from '../pages/Dashboards/Organization';

import OrgDocStatus from '../pages/Status/OrgDocStatus';
import DietitianVerify from '../pages/Verify/DietitianVerify';
import CorporateVerify from '../pages/Verify/CorporateVerify';

import ChangePassword from '../pages/ChangePassword';
import EditProfile from '../pages/EditProfile';
import BlogModeration from '../pages/Blog/BlogModeration';
import Blog from '../pages/Blog';
import BlogPost from '../pages/Blog/BlogPost';

export default function OrganizationRoutes() {
  return (
    <AuthProvider currentRole="organization">
      <div className="p-6">
        <Routes>
          <Route index element={<Navigate to="home" replace />} />

          {/* All routes are automatically protected by ProtectedProvider in Layout.jsx */}
          <Route path="home" element={<OrganizationHome />} />
          <Route path="profile" element={<OrganizationDashboard />} />
          <Route path="doc-status" element={<OrgDocStatus />} />
          <Route path="change-pass" element={<ChangePassword />} />
          <Route path="edit-profile" element={<EditProfile />} />

          {/* Verified Routes - Require Organization Verification */}
          <Route
            path="verify-dietitian"
            element={
              <VerifyProvider requiredRole="organization" redirectTo="/organization/doc-status">
                <DietitianVerify />
              </VerifyProvider>
            } />
          <Route
            path="verify-corporate"
            element={
              <VerifyProvider requiredRole="organization" redirectTo="/organization/doc-status">
                <CorporateVerify />
              </VerifyProvider>
            } />

          {/* Blog Moderation Routes */}
          <Route path="blog-moderation" element={<BlogModeration />} />
          <Route path="blogs" element={<Blog/>} />
          <Route path="blog/:id" element={<BlogPost />} />

          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}