import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { RequireAuth, RequireRole } from './components/permission'
import { ToastContainer } from './components/ui'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import { ForgotPasswordPage, ResetPasswordPage, UnauthorizedPage } from './pages/auth/OtherAuthPages'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentGoals from './pages/student/Goals'
import StudentEvaluations from './pages/student/Evaluations'
import StudentReports from './pages/student/Reports'
import StudentNotifications from './pages/student/Notifications'

// Instructor pages
import InstructorDashboard from './pages/instructor/Dashboard'
import { InstructorStudents, InstructorGoalApprovals } from './pages/instructor/Students'
import InstructorStudentDetail from './pages/instructor/StudentDetail'
import InstructorEvaluations from './pages/instructor/Evaluations'
import { InstructorPerformanceRecords, InstructorRecommendations } from './pages/instructor/Records'

// Guardian pages
import { GuardianDashboard, GuardianStudents, GuardianStudentDetail } from './pages/guardian'

// Super Admin pages
import SuperAdminDashboard from './pages/super-admin/Dashboard'
import SuperAdminUsers from './pages/super-admin/Users'
import SuperAdminStudents from './pages/super-admin/Students'
import SuperAdminInstructors from './pages/super-admin/Instructors'
import SuperAdminAnalytics from './pages/super-admin/Analytics'
import SuperAdminReports from './pages/super-admin/Reports'

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard'
import ManagerFinalEvaluations from './pages/manager/FinalEvaluations'
import ManagerPerformanceApprovals from './pages/manager/PerformanceApprovals'
import ManagerAuditLogs from './pages/manager/AuditLogs'
import ManagerExports from './pages/manager/Exports'
import ManagerReports from './pages/manager/Reports'
import ManagerSettings from './pages/manager/Settings'

function RoleRedirect() {
  const { user: appUser, activeRole } = useAuth()
  if (!appUser) return <Navigate to="/login" replace />
  const role = activeRole || appUser.roles[0]
  if (role === 'manager') return <Navigate to="/manager/dashboard" replace />
  if (role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />
  if (role === 'instructor') return <Navigate to="/instructor/dashboard" replace />
  if (role === 'guardian') return <Navigate to="/guardian/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter basename="/SPMS">
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Root redirect */}
          <Route path="/" element={<RequireAuth><RoleRedirect /></RequireAuth>} />

          {/* Student */}
          <Route path="/student" element={<RequireAuth><RequireRole roles={['student','instructor','super_admin','manager']}><Navigate to="/student/dashboard" replace /></RequireRole></RequireAuth>} />
          <Route path="/student/dashboard" element={<RequireAuth><RequireRole roles={['student','instructor','super_admin','manager']}><StudentDashboard /></RequireRole></RequireAuth>} />
          <Route path="/student/profile" element={<RequireAuth><RequireRole roles={['student','instructor','super_admin','manager']}><StudentProfile /></RequireRole></RequireAuth>} />
          <Route path="/student/goals" element={<RequireAuth><RequireRole roles={['student','instructor','super_admin','manager']}><StudentGoals /></RequireRole></RequireAuth>} />
          <Route path="/student/evaluations" element={<RequireAuth><RequireRole roles={['student','instructor','super_admin','manager']}><StudentEvaluations /></RequireRole></RequireAuth>} />
          <Route path="/student/reports" element={<RequireAuth><RequireRole roles={['student','instructor','super_admin','manager']}><StudentReports /></RequireRole></RequireAuth>} />
          <Route path="/student/notifications" element={<RequireAuth><RequireRole roles={['student','instructor','super_admin','manager']}><StudentNotifications /></RequireRole></RequireAuth>} />

          {/* Instructor */}
          <Route path="/instructor/dashboard" element={<RequireAuth><RequireRole roles={['instructor','super_admin','manager']}><InstructorDashboard /></RequireRole></RequireAuth>} />
          <Route path="/instructor/students" element={<RequireAuth><RequireRole roles={['instructor','super_admin','manager']}><InstructorStudents /></RequireRole></RequireAuth>} />
          <Route path="/instructor/students/:studentId" element={<RequireAuth><RequireRole roles={['instructor','super_admin','manager']}><InstructorStudentDetail /></RequireRole></RequireAuth>} />
          <Route path="/instructor/goal-approvals" element={<RequireAuth><RequireRole roles={['instructor','super_admin','manager']}><InstructorGoalApprovals /></RequireRole></RequireAuth>} />
          <Route path="/instructor/evaluations" element={<RequireAuth><RequireRole roles={['instructor','super_admin','manager']}><InstructorEvaluations /></RequireRole></RequireAuth>} />
          <Route path="/instructor/recommendations" element={<RequireAuth><RequireRole roles={['instructor','super_admin','manager']}><InstructorRecommendations /></RequireRole></RequireAuth>} />
          <Route path="/instructor/performance-records" element={<RequireAuth><RequireRole roles={['instructor','super_admin','manager']}><InstructorPerformanceRecords /></RequireRole></RequireAuth>} />

          {/* Guardian */}
          <Route path="/guardian/dashboard" element={<RequireAuth><RequireRole roles={['guardian','super_admin','manager']}><GuardianDashboard /></RequireRole></RequireAuth>} />
          <Route path="/guardian/students" element={<RequireAuth><RequireRole roles={['guardian','super_admin','manager']}><GuardianStudents /></RequireRole></RequireAuth>} />
          <Route path="/guardian/students/:studentId" element={<RequireAuth><RequireRole roles={['guardian','super_admin','manager']}><GuardianStudentDetail /></RequireRole></RequireAuth>} />
          <Route path="/guardian/notifications" element={<RequireAuth><RequireRole roles={['guardian','super_admin','manager']}><StudentNotifications /></RequireRole></RequireAuth>} />

          {/* Super Admin */}
          <Route path="/super-admin/dashboard" element={<RequireAuth><RequireRole roles={['super_admin','manager']}><SuperAdminDashboard /></RequireRole></RequireAuth>} />
          <Route path="/super-admin/users" element={<RequireAuth><RequireRole roles={['super_admin','manager']}><SuperAdminUsers /></RequireRole></RequireAuth>} />
          <Route path="/super-admin/students" element={<RequireAuth><RequireRole roles={['super_admin','manager']}><SuperAdminStudents /></RequireRole></RequireAuth>} />
          <Route path="/super-admin/instructors" element={<RequireAuth><RequireRole roles={['super_admin','manager']}><SuperAdminInstructors /></RequireRole></RequireAuth>} />
          <Route path="/super-admin/analytics" element={<RequireAuth><RequireRole roles={['super_admin','manager']}><SuperAdminAnalytics /></RequireRole></RequireAuth>} />
          <Route path="/super-admin/reports" element={<RequireAuth><RequireRole roles={['super_admin','manager']}><SuperAdminReports /></RequireRole></RequireAuth>} />

          {/* Manager */}
          <Route path="/manager/dashboard" element={<RequireAuth><RequireRole roles={['manager']}><ManagerDashboard /></RequireRole></RequireAuth>} />
          <Route path="/manager/final-evaluations" element={<RequireAuth><RequireRole roles={['manager']}><ManagerFinalEvaluations /></RequireRole></RequireAuth>} />
          <Route path="/manager/performance-records-approval" element={<RequireAuth><RequireRole roles={['manager']}><ManagerPerformanceApprovals /></RequireRole></RequireAuth>} />
          <Route path="/manager/audit-logs" element={<RequireAuth><RequireRole roles={['manager']}><ManagerAuditLogs /></RequireRole></RequireAuth>} />
          <Route path="/manager/exports" element={<RequireAuth><RequireRole roles={['manager']}><ManagerExports /></RequireRole></RequireAuth>} />
          <Route path="/manager/reports" element={<RequireAuth><RequireRole roles={['manager']}><ManagerReports /></RequireRole></RequireAuth>} />
          <Route path="/manager/settings" element={<RequireAuth><RequireRole roles={['manager']}><ManagerSettings /></RequireRole></RequireAuth>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
