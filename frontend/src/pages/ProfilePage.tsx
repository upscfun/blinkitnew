import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import { User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setPwLoading(true);
    try {
      await authApi.changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2"><User size={18} /> Personal Info</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text' },
            { key: 'phone', label: 'Phone', type: 'tel' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="input-field" />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <input type="email" value={user?.email} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2"><Lock size={18} /> Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">{f.label}</label>
              <input type="password" required value={pwForm[f.key as keyof typeof pwForm]}
                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="input-field" placeholder="••••••••" />
            </div>
          ))}
          <button type="submit" disabled={pwLoading} className="btn-primary">{pwLoading ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
}
