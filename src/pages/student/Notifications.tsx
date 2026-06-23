import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { InfoCard, EmptyState, LoadingState } from '../../components/ui';
import { toast } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/index';
import type { Notification } from '../../types';

export default function StudentNotifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const n = await notificationService.getByUser(user.id);
        setNotifications(n);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllRead(user.id);
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary text-sm gap-1">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <InfoCard title={`${notifications.length} Notifications`}>
          {notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              icon={<Bell size={40} />}
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`flex gap-3 p-3 rounded-xl cursor-pointer transition ${
                    n.is_read ? 'bg-white' : 'bg-primary-50 hover:bg-primary-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.is_read ? 'bg-neutral-200' : 'bg-primary-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.is_read ? 'text-neutral-600' : 'text-neutral-900 font-medium'}`}>{n.title}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-neutral-300 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </div>
    </DashboardLayout>
  );
}
