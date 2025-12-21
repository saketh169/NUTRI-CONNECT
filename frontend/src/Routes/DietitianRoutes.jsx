import { Routes, Route, Navigate } from 'react-router-dom';
import { VerifyProvider } from '../contexts/VerifyContext';
import { AuthProvider } from '../contexts/AuthContext';

import DietitianHome from '../pages/HomePages/DietitianHome';
import DietitianDashboard from '../pages/Dashboards/Dietitian';
import DietitianSchedule from '../pages/Schedules/DietitanSchedule';
import DietitianSetup from '../pages/DietitianSetup';
import DietitianDocStatus from '../pages/Status/DietitianDocStatus';
import ChangePassword from '../pages/ChangePassword';
import EditProfile from '../pages/EditProfile';
import DietitianAddPlanForm from '../pages/MealPlans/DietitianAddPlanForm';
import ClientsList from '../pages/Appointments/ClientsList';
import ChatPage from '../pages/Chat/ChatPage';

import Blog from '../pages/Blog';
import Contact from '../pages/Contactus';
import CreateBlog from '../pages/Blog/CreateBlog';
import BlogPost from '../pages/Blog/BlogPost';
import DietitianLabReportViewer from '../pages/LabReports/DietitianLabReportViewer';
import DietitianActivities from '../pages/Activities/DietitianActivities';



export default function DietitianRoutes() {
  return (
    <AuthProvider currentRole="dietitian">
      <div className="p-6">
        <Routes>
          <Route index element={<Navigate to="home" replace />} />

        {/* All routes are automatically protected by ProtectedProvider in Layout.jsx */}
        <Route path="home" element={<DietitianHome />} />
        <Route path="profile" element={<DietitianDashboard />} />
        <Route path="activities" element={<DietitianActivities />} />
        <Route path="profile-setup" element={<DietitianSetup/>} />
        <Route path="doc-status" element={<DietitianDocStatus/>} />
        <Route path="change-pass" element={<ChangePassword/>} />
        <Route path="edit-profile" element={<EditProfile />} />

        {/* Verified Routes - Require Dietitian Verification */}
        <Route
          path="schedule"
          element={
            <VerifyProvider requiredRole="dietitian" redirectTo="/verify/dietitian">
              <DietitianSchedule/>
            </VerifyProvider>
          } />
        <Route
          path="add-plans"
          element={
            <VerifyProvider requiredRole="dietitian" redirectTo="/verify/dietitian">
              <DietitianAddPlanForm/>
            </VerifyProvider>
          } />
        <Route
          path="clients-profiles"
          element={
            <VerifyProvider requiredRole="dietitian" redirectTo="/verify/dietitian">
              <ClientsList/>
            </VerifyProvider>
          } />

        {/* Blog Routes */}
        <Route path="blogs" element={<Blog/>} />
        <Route path="blog/:id" element={<BlogPost />} />
        <Route path="create-blog" element={<CreateBlog />} />
        <Route path="edit-blog/:id" element={<CreateBlog />} />

        {/* Optional: Public pages */}
         <Route path="blog" element={<Blog/>} />
         <Route path="contact-us" element={<Contact/>} />
         
         {/* Chat Route */}
         <Route path="chat/:conversationId" element={<ChatPage />} />
         
         {/* Lab Reports Route */}
         <Route path="lab-reports" element={<DietitianLabReportViewer />} />
         <Route path="lab-reports/:clientId" element={<DietitianLabReportViewer />} />
      </Routes>
    </div>
    </AuthProvider>
  );
}
