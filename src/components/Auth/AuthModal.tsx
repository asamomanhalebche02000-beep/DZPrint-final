import React, { useState } from 'react';
import { X, Lock, Mail, User, Store, ArrowRight, ArrowLeft, KeyRound, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const { t, isRtl } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');

  if (!isOpen) return null;

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    // Auto-generate clean slug
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStoreSlug(generated || 'my-store');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed. Please check your credentials.');
        } else {
          onSuccess?.();
          onClose();
        }
      } else if (mode === 'signup') {
        if (!fullName.trim() || !storeName.trim() || !storeSlug.trim()) {
          setError('Please fill in all fields to create your store.');
          setLoading(false);
          return;
        }
        const res = await signUp({
          fullName,
          email,
          password,
          storeName,
          storeSlug,
        });
        if (!res.success) {
          setError(res.error || 'Failed to create account and store.');
        } else {
          onSuccess?.();
          onClose();
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (!res.success) {
          setError(res.error || 'Failed to send reset link.');
        } else {
          setSuccessMessage(t.auth_reset_link_sent);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
            {mode === 'signin' && <Lock className="w-6 h-6" />}
            {mode === 'signup' && <Store className="w-6 h-6" />}
            {mode === 'forgot' && <KeyRound className="w-6 h-6" />}
          </div>

          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            {mode === 'signin' && t.auth_sign_in}
            {mode === 'signup' && t.auth_create_account}
            {mode === 'forgot' && t.auth_reset_password}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {mode === 'signin' && 'DzPrint Supabase Authentication'}
            {mode === 'signup' && t.store_isolated_note}
            {mode === 'forgot' && t.auth_send_reset_link}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.auth_full_name} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute start-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Mohamed Benali"
                    className="w-full ps-9 pe-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.auth_store_name} *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-neutral-400 absolute start-3 top-3" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={e => handleStoreNameChange(e.target.value)}
                    placeholder="DzPrint Alger Centre"
                    className="w-full ps-9 pe-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.auth_store_slug} *
                </label>
                <input
                  type="text"
                  required
                  value={storeSlug}
                  onChange={e => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="dzprint-alger"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 font-mono text-neutral-600 dark:text-neutral-300"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              {t.auth_email} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute start-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@dzprint.dz"
                className="w-full ps-9 pe-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 dark:text-white"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {t.auth_password} *
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMessage(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    {t.auth_forgot_password}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute start-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-9 pe-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:border-amber-500 dark:text-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {mode === 'signin' && t.auth_sign_in}
              {mode === 'signup' && t.auth_sign_up}
              {mode === 'forgot' && t.auth_send_reset_link}
            </span>
            {!loading && (isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
          </button>
        </form>

        {/* Footer switch modes */}
        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center">
          {mode === 'signin' && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t.auth_dont_have_account}{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('signup');
                }}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                {t.auth_sign_up}
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t.auth_already_have_account}{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('signin');
                }}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                {t.auth_sign_in}
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                setMode('signin');
              }}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
            >
              {t.auth_remember_password}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
