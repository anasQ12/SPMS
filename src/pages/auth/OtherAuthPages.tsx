import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout';
import { authService } from '../../services/authService';
import { useLanguage } from '../../contexts/LanguageContext';
import { CheckCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.resetPasswordForEmail(email);
      setSent(true);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <CheckCircle className="mx-auto text-success-500 mb-3" size={40} />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Check your email</h2>
          <p className="text-sm text-neutral-500 mb-6">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <Link to="/login" className="btn-secondary">
            {t('auth.backToLogin')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('auth.resetPassword')}</h1>
      <p className="text-sm text-neutral-500 mb-6">Enter your email to receive a reset link.</p>

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
          />
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg px-3 py-2 text-sm text-danger-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? 'Sending...' : t('auth.sendReset')}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/login" className="text-sm text-primary-600 hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.updatePassword(password);
      setDone(true);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <CheckCircle className="mx-auto text-success-500 mb-3" size={40} />
          <h2 className="text-xl font-bold mb-2">Password updated!</h2>
          <p className="text-sm text-neutral-500 mb-6">Your password has been reset successfully.</p>
          <Link to="/login" className="btn-primary">Sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Set new password</h1>
      <p className="text-sm text-neutral-500 mb-6">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New Password</label>
          <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input type="password" className="input-field" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg px-3 py-2 text-sm text-danger-700">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  );
}

export function UnauthorizedPage() {
  return (
    <AuthLayout>
      <div className="text-center py-4">
        <div className="text-5xl mb-3">🚫</div>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-neutral-500 mb-6">You don't have permission to view this page.</p>
        <Link to="/login" className="btn-secondary">Back to Sign In</Link>
      </div>
    </AuthLayout>
  );
}
