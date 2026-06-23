import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Target, ClipboardList, Award, FileText,
  Bell, LogOut, Globe, ChevronDown, Menu, X, Settings, BarChart2,
  UserCheck, Shield, BookOpen, TrendingUp, ClipboardCheck,
  FileCheck, Download, History, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { UserRole } from '../../types';

// ── Navigation config ─────────────────────────────────────────────────────────

const navConfig: Record<UserRole, { path: string; label: string; labelAr: string; icon: React.ReactNode }[]> = {
  student: [
    { path: '/student/dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
    { path: '/student/profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: <Users size={18} /> },
    { path: '/student/goals', label: 'Goals', labelAr: 'الأهداف', icon: <Target size={18} /> },
    { path: '/student/evaluations', label: 'Evaluations', labelAr: 'التقييمات', icon: <ClipboardList size={18} /> },
    { path: '/student/reports', label: 'Reports', labelAr: 'التقارير', icon: <FileText size={18} /> },
    { path: '/student/notifications', label: 'Notifications', labelAr: 'الإشعارات', icon: <Bell size={18} /> },
  ],
  instructor: [
    { path: '/instructor/dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
    { path: '/instructor/students', label: 'Students', labelAr: 'الطلاب', icon: <GraduationCap size={18} /> },
    { path: '/instructor/goal-approvals', label: 'Goal Approvals', labelAr: 'موافقات الأهداف', icon: <FileCheck size={18} /> },
    { path: '/instructor/evaluations', label: 'Evaluations', labelAr: 'التقييمات', icon: <ClipboardList size={18} /> },
    { path: '/instructor/recommendations', label: 'Recommendations', labelAr: 'التوصيات', icon: <BookOpen size={18} /> },
    { path: '/instructor/performance-records', label: 'Performance Records', labelAr: 'سجلات الأداء', icon: <Award size={18} /> },
  ],
  guardian: [
    { path: '/guardian/dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
    { path: '/guardian/students', label: 'My Students', labelAr: 'طلابي', icon: <GraduationCap size={18} /> },
    { path: '/guardian/reports', label: 'Reports', labelAr: 'التقارير', icon: <FileText size={18} /> },
    { path: '/guardian/notifications', label: 'Notifications', labelAr: 'الإشعارات', icon: <Bell size={18} /> },
  ],
  super_admin: [
    { path: '/super-admin/dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
    { path: '/super-admin/users', label: 'Users', labelAr: 'المستخدمون', icon: <Users size={18} /> },
    { path: '/super-admin/students', label: 'Students', labelAr: 'الطلاب', icon: <GraduationCap size={18} /> },
    { path: '/super-admin/instructors', label: 'Instructors', labelAr: 'المدربون', icon: <UserCheck size={18} /> },
    { path: '/super-admin/analytics', label: 'Analytics', labelAr: 'التحليلات', icon: <BarChart2 size={18} /> },
    { path: '/super-admin/reports', label: 'Reports', labelAr: 'التقارير', icon: <FileText size={18} /> },
  ],
  manager: [
    { path: '/manager/dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
    { path: '/manager/final-evaluations', label: 'Final Evaluations', labelAr: 'التقييمات النهائية', icon: <ClipboardCheck size={18} /> },
    { path: '/manager/performance-records-approval', label: 'Performance Records', labelAr: 'سجلات الأداء', icon: <Award size={18} /> },
    { path: '/manager/audit-logs', label: 'Audit Logs', labelAr: 'سجلات التدقيق', icon: <History size={18} /> },
    { path: '/manager/exports', label: 'Exports', labelAr: 'التصدير', icon: <Download size={18} /> },
    { path: '/manager/reports', label: 'Reports', labelAr: 'التقارير', icon: <TrendingUp size={18} /> },
    { path: '/manager/settings', label: 'Settings', labelAr: 'الإعدادات', icon: <Settings size={18} /> },
  ],
};

const rolePriority: UserRole[] = ['manager', 'super_admin', 'instructor', 'guardian', 'student'];
const roleLabels: Record<UserRole, { en: string; ar: string }> = {
  manager: { en: 'Manager', ar: 'مدير' },
  super_admin: { en: 'Super Admin', ar: 'مشرف عام' },
  instructor: { en: 'Instructor', ar: 'مدرب' },
  guardian: { en: 'Guardian', ar: 'ولي أمر' },
  student: { en: 'Student', ar: 'طالب' },
};

const roleDefaultPath: Record<UserRole, string> = {
  manager: '/manager/dashboard',
  super_admin: '/super-admin/dashboard',
  instructor: '/instructor/dashboard',
  guardian: '/guardian/dashboard',
  student: '/student/dashboard',
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

export const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { activeRole } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const isRTL = language === 'ar';

  const navItems = activeRole ? navConfig[activeRole] : [];

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 h-full w-64 bg-white border-e border-neutral-200 z-40 flex flex-col
        transition-transform duration-200
        ${isRTL ? 'right-0' : 'left-0'}
        ${open ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-primary-700 text-lg">SPMS</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-neutral-400 hover:text-neutral-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path.split('/:')[0]);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{language === 'ar' ? item.labelAr : item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

// ── RoleSwitcher ──────────────────────────────────────────────────────────────

export const RoleSwitcher: React.FC = () => {
  const { user, activeRole, setActiveRole } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user || user.roles.length <= 1) return null;

  const handleSwitch = (role: UserRole) => {
    setActiveRole(role);
    navigate(roleDefaultPath[role]);
    setOpen(false);
  };

  const sortedRoles = [...user.roles].sort((a, b) => rolePriority.indexOf(a) - rolePriority.indexOf(b));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
      >
        <Shield size={14} className="text-primary-500" />
        {activeRole ? (language === 'ar' ? roleLabels[activeRole].ar : roleLabels[activeRole].en) : ''}
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 start-0 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-20 min-w-36">
            {sortedRoles.map((role) => (
              <button
                key={role}
                onClick={() => handleSwitch(role)}
                className={`w-full text-start px-3 py-2 text-sm hover:bg-neutral-50 transition ${activeRole === role ? 'text-primary-600 font-medium' : 'text-neutral-700'}`}
              >
                {language === 'ar' ? roleLabels[role].ar : roleLabels[role].en}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── LanguageSwitcher ──────────────────────────────────────────────────────────

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
    >
      <Globe size={14} />
      {language === 'en' ? 'عربي' : 'English'}
    </button>
  );
};

// ── TopBar ────────────────────────────────────────────────────────────────────

export const TopBar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
          <Menu size={20} />
        </button>
        <RoleSwitcher />
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 transition"
          >
            {user?.profile_picture_url ? (
              <img src={user.profile_picture_url} alt={user.full_name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-neutral-700 hidden sm:block max-w-32 truncate">{user?.full_name}</span>
            <ChevronDown size={14} className="text-neutral-400" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute top-full end-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-20 min-w-48">
                <div className="px-3 py-2 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-900">{user?.full_name}</p>
                  <p className="text-xs text-neutral-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// ── DashboardLayout ───────────────────────────────────────────────────────────

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// ── AuthLayout ────────────────────────────────────────────────────────────────

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-bold text-primary-700 text-2xl">SPMS</span>
          </div>
          <p className="text-sm text-neutral-500">Student Progress Management System</p>
        </div>
        <div className="card p-8 shadow-lg">
          {children}
        </div>
        <div className="mt-4 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};
