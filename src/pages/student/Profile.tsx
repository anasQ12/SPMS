import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { InfoCard, LoadingState } from '../../components/ui';
import { toast } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentService } from '../../services/studentService';
import { storageService } from '../../services/index';
import { userService } from '../../services/userService';
import type { Student } from '../../types';

export default function StudentProfile() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({
    level: '',
    dob: '',
    social_status: '',
    hobbies: '',
    strengths: '',
    weaknesses: '',
    personal_notes: '',
  });
  const [fullName, setFullName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const s = await studentService.getByUserId(user.id);
      if (!s) return;
        setStudent(s);
        setForm({
          level: s.current_level || '',
          dob: s.dob || '',
          social_status: s.social_status || '',
          hobbies: s.hobbies || '',
          strengths: s.strengths || '',
          weaknesses: s.weaknesses || '',
          personal_notes: s.personal_notes || '',
        });
        setFullName(user.full_name || '');
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!student || !user) return;
    setSaving(true);
    try {
      await studentService.updateProfile(student.id, form);
      if (fullName !== user.full_name) {
        await userService.update(user.id, { full_name: fullName });
        await refreshUser();
      }
      toast.success(t('common.successSaved'));
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await storageService.uploadAvatar(user.id, file);
      await userService.updateAvatar(user.id, url);
      await refreshUser();
      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to upload picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900">{t('profile.title')}</h1>

        {/* Avatar */}
        <div className="card p-6 flex items-center gap-5">
          <div className="relative">
            {user?.profile_picture_url ? (
              <img src={user.profile_picture_url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary-700 text-2xl font-bold flex items-center justify-center">
                {user?.full_name?.charAt(0)}
              </div>
            )}
            <label className="absolute -bottom-1 -end-1 bg-white border border-neutral-200 rounded-lg p-1.5 cursor-pointer hover:bg-neutral-50 transition shadow-sm">
              <Camera size={14} className="text-neutral-500" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-neutral-800">{user?.full_name}</p>
            <p className="text-sm text-neutral-400">{user?.email}</p>
            {uploading && <p className="text-xs text-primary-500 mt-1">Uploading...</p>}
          </div>
        </div>

        <InfoCard title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('profile.fullName')}</label>
              <input type="text" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label">{t('profile.dob')}</label>
              <input type="date" className="input-field" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('profile.level')}</label>
              <input type="text" className="input-field" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('profile.socialStatus')}</label>
              <input type="text" className="input-field" value={form.social_status} onChange={(e) => setForm({ ...form, social_status: e.target.value })} />
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Development Notes">
          <div className="space-y-4">
            <div>
              <label className="label">{t('profile.strengths')}</label>
              <textarea className="input-field resize-none" rows={3} value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('profile.weaknesses')}</label>
              <textarea className="input-field resize-none" rows={3} value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('profile.hobbies')}</label>
              <textarea className="input-field resize-none" rows={2} value={form.hobbies} onChange={(e) => setForm({ ...form, hobbies: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('profile.personalNotes')}</label>
              <textarea className="input-field resize-none" rows={3} value={form.personal_notes} onChange={(e) => setForm({ ...form, personal_notes: e.target.value })} />
            </div>
          </div>
        </InfoCard>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : t('common.save')}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
