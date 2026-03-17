import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import BrowsePage from "./pages/BrowsePage";
import BookmarksPage from "./pages/BookmarksPage";
import ProfilePage from "./pages/ProfilePage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminDepartmentsPage from "./pages/admin/AdminDepartmentsPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import AdminFilesPage from "./pages/admin/AdminFilesPage";

function App(): JSX.Element {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Student */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin + Discipline Admin */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/files" element={<AdminFilesPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;