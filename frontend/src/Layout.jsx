import { Outlet } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { ProtectedProvider } from './contexts/ProtectedContext';
import { ProfileProvider } from './contexts/ProfileContext';
import UserLayout from './Routes/UserRoutes.jsx';
import AdminLayout from './Routes/AdminRoutes.jsx';
import OrganizationLayout from './Routes/OrganizationRoutes.jsx';
import CorporateLayout from './Routes/CorporateRoutes.jsx';
import DietitianLayout from './Routes/DietitianRoutes.jsx';

export default function Layout() {
  return (
    <ProfileProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1">
          <Routes>
            <Route path="/user/*" element={
              <ProtectedProvider requiredRole="user">
                <UserLayout />
              </ProtectedProvider>
            } />
          <Route path="/admin/*" element={
            <ProtectedProvider requiredRole="admin">
              <AdminLayout />
            </ProtectedProvider>
          } />
          <Route path="/organization/*" element={
            <ProtectedProvider requiredRole="organization">
              <OrganizationLayout />
            </ProtectedProvider>
          } />
          <Route path="/corporatepartner/*" element={
            <ProtectedProvider requiredRole="corporatepartner">
              <CorporateLayout />
            </ProtectedProvider>
          } />
          <Route path="/dietitian/*" element={
            <ProtectedProvider requiredRole="dietitian">
              <DietitianLayout />
            </ProtectedProvider>
          } />
          <Route path="*" element={<div>Role Not Found</div>} />
        </Routes>
      </main>
    </div>
    </ProfileProvider>
  );
}