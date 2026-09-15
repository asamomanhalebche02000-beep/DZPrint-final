import React, { useState } from 'react';
import { User, Shield, KeyRound, CheckCircle, AlertCircle, Loader2, Store as StoreIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminAccountSettings: React.FC = () => {
  const { user, profile, store, updatePassword, updateProfile } = useAuth();
  const { t, language } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await updateProfile({ full_name: fullName.trim() });
      if (res.success) {
        setProfileMsg({
          type: 'success',
          text: language === 'ar' ? 'تم حفظ التعديلات بنجاح' : language === 'fr' ? 'Profil mis à jour avec succès' : 'Profile updated successfully',
        });
      } else {
        setProfileMsg({
          type: 'error',
          text: res.error || (language === 'ar' ? 'فشل تحديث الملف الشخصي' : language === 'fr' ? 'Échec de la mise à jour' : 'Failed to update profile'),
        });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: 'error',
        text: language === 'ar' ? 'كلمتا المرور غير متطابقتين' : language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match',
      });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({
        type: 'error',
        text: language === 'ar' ? 'كلمة المرور يجب ألا تقل عن 6 أحرف' : language === 'fr' ? 'Le mot de passe doit comporter au moins 6 caractères' : 'Password must be at least 6 characters',
      });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setPasswordMsg({
          type: 'success',
          text: language === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : language === 'fr' ? 'Mot de passe mis à jour avec succès' : 'Password updated successfully',
        });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({
          type: 'error',
          text: res.error || (language === 'ar' ? 'فشل تحديث كلمة المرور' : language === 'fr' ? 'Échec du changement de mot de passe' : 'Failed to update password'),
        });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const roleLabel =
    profile?.role === 'owner'
      ? t.auth_role_owner
      : profile?.role === 'admin'
      ? t.auth_role_admin
      : t.auth_role_staff;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          {t.auth_account_settings}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t.store_isolated_note}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              {t.auth_full_name}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {roleLabel}
            </span>
          </div>

          {profileMsg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                {t.auth_email}
              </label>
              <input
                type="text"
                disabled
                value={user?.email || profile?.email || ''}
                className="w-full px-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t.auth_full_name}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {store && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <StoreIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    <strong>{t.auth_store_name}:</strong> {store.name} ({store.slug})
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-3 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs rounded-xl transition flex items-center gap-2"
            >
              {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{t.save_changes}</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              {t.auth_new_password}
            </h3>
          </div>

          {passwordMsg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t.auth_new_password}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t.auth_confirm_password}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
            >
              {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{t.save_changes}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
