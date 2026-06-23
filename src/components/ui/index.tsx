import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, Loader2, Inbox, RefreshCw } from 'lucide-react';
import type { GoalStatus, ApprovalStatus } from '../../types';

// ── StatusBadge ──────────────────────────────────────────────────────────────

const goalStatusColors: Record<GoalStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-600',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-success-50 text-success-700',
  rejected: 'bg-danger-50 text-danger-700',
  recommended_for_edit: 'bg-warning-50 text-warning-700',
  locked: 'bg-neutral-200 text-neutral-700',
  completed: 'bg-success-50 text-success-700',
  carried_over: 'bg-accent-50 text-accent-600',
  missed_submission: 'bg-danger-50 text-danger-700',
};

const recordStatusColors: Record<ApprovalStatus, string> = {
  pending: 'bg-warning-50 text-warning-700',
  approved: 'bg-success-50 text-success-700',
  rejected: 'bg-danger-50 text-danger-700',
};

export const StatusBadge: React.FC<{
  status: GoalStatus | ApprovalStatus | string;
  label: string;
  size?: 'sm' | 'md';
}> = ({ status, label, size = 'sm' }) => {
  const color =
    goalStatusColors[status as GoalStatus] ||
    recordStatusColors[status as ApprovalStatus] ||
    'bg-neutral-100 text-neutral-600';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${color}`}>
      {label}
    </span>
  );
};

// ── MetricCard ────────────────────────────────────────────────────────────────

export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}> = ({ title, value, subtitle, icon, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    danger: 'bg-danger-50 text-danger-700',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl ${colorMap[color]} flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// ── InfoCard ──────────────────────────────────────────────────────────────────

export const InfoCard: React.FC<{
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, children, action, className = '' }) => (
  <div className={`card p-5 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-neutral-800">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, description, action, icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-neutral-300 mb-4">
      {icon || <Inbox size={48} />}
    </div>
    <h3 className="font-semibold text-neutral-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-neutral-400 mb-4 max-w-sm">{description}</p>}
    {action}
  </div>
);

// ── LoadingState ──────────────────────────────────────────────────────────────

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Loader2 className="animate-spin text-primary-500 mb-3" size={32} />
    <p className="text-sm text-neutral-500">{message}</p>
  </div>
);

// ── ErrorState ────────────────────────────────────────────────────────────────

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Something went wrong.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <AlertTriangle className="text-danger-500 mb-3" size={32} />
    <p className="text-sm text-neutral-700 mb-3">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-xs gap-1">
        <RefreshCw size={14} /> Try again
      </button>
    )}
  </div>
);

// ── ConfirmDialog ─────────────────────────────────────────────────────────────

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  reasonRequired?: boolean;
}> = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'primary', onConfirm, onCancel, reasonRequired }) => {
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (reasonRequired && !reason.trim()) return;
    onConfirm();
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 mb-4">{message}</p>
        {reasonRequired && (
          <textarea
            className="input-field text-sm mb-4 resize-none"
            rows={3}
            placeholder="Reason is required..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">{cancelLabel}</button>
          <button
            onClick={handleConfirm}
            disabled={reasonRequired && !reason.trim()}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Toast System ──────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

export const toast = {
  show(message: string, type: Toast['type'] = 'info') {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, message, type }];
    toastListeners.forEach((l) => l(toasts));
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      toastListeners.forEach((l) => l(toasts));
    }, 4000);
  },
  success(msg: string) { this.show(msg, 'success'); },
  error(msg: string) { this.show(msg, 'error'); },
  warning(msg: string) { this.show(msg, 'warning'); },
};

export const ToastContainer: React.FC = () => {
  const [list, setList] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setList);
    return () => { toastListeners = toastListeners.filter((l) => l !== setList); };
  }, []);

  const iconMap = {
    success: <CheckCircle size={16} className="text-success-700" />,
    error: <XCircle size={16} className="text-danger-700" />,
    warning: <AlertTriangle size={16} className="text-warning-700" />,
    info: <Info size={16} className="text-primary-500" />,
  };

  const colorMap = {
    success: 'bg-success-50 border-success-500',
    error: 'bg-danger-50 border-danger-500',
    warning: 'bg-warning-50 border-warning-500',
    info: 'bg-primary-50 border-primary-500',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {list.map((t) => (
        <div key={t.id} className={`flex items-start gap-2 rounded-xl border shadow-md px-4 py-3 text-sm font-medium ${colorMap[t.type]} animate-in slide-in-from-bottom-2`}>
          {iconMap[t.type]}
          <span className="text-neutral-800">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

// Shim useEffect for ToastContainer (it's used inside component)
import { useEffect } from 'react';
