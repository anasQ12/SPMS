import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../components/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { UserRole } from '../../types';

const roleRedirects: Record<UserRole, string> = {
  manager: '/manager/dashboard',
  super_admin: '/super-admin/dashboard',
  instructor: '/instructor/dashboard',
  guardian: '/guardian/dashboard',
  student: '/student/dashboard',
};

const rolePriority: UserRole[] = ['manager', 'super_admin', 'instructor', 'guardian', 'student'];

export default function LoginPage() {
  const { signIn, user, activeRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // After signIn, useAuth re-fetches user, so we need fresh user
      // Small delay to let auth context update
      setTimeout(() => {
        const savedRole = localStorage.getItem('spms_active_role') as UserRole | null;
        if (savedRole && roleRedirects[savedRole]) {
          navigate(from || roleRedirects[savedRole], { replace: true });
        } else {
          navigate(from || '/student/dashboard', { replace: true });
        }
      }, 300);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('auth.loginTitle')}</h1>
      <p className="text-sm text-neutral-500 mb-6">{t('auth.loginSubtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth.email')}</label>
          <input
            type="email"
            className="input-field"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">{t('auth.password')}</label>
          <input
            type="password"
            className="input-field"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg px-3 py-2 text-sm text-danger-700">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Signing in...
            </span>
          ) : t('auth.login')}
        </button>
      </form>

      <div className="mt-6 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
        <p className="text-xs text-neutral-500 mb-1 font-medium">Demo credentials</p>
        <p className="text-xs text-neutral-400">Use your Supabase user credentials to log in.</p>
      </div>
    </AuthLayout>
  );
}
