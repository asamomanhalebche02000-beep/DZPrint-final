import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, Store } from '../types';

interface SignUpParams {
  fullName: string;
  email: string;
  password: string;
  storeName: string;
  storeSlug: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  store: Store | null;
  isAuthenticated: boolean;
  role: Profile['role'] | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfileAndStore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile and store associated with the current session
  const fetchProfileAndStore = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setProfile(null);
      setStore(null);
      return;
    }

    const token = currentSession.access_token;

    try {
      // Call server to fetch authenticated profile & store
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.store) setStore(data.store);
      } else {
        // Fallback: direct Supabase query if client Supabase has access
        if (isSupabaseConfigured) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (prof) {
            setProfile(prof as Profile);
            if (prof.store_id) {
              const { data: st } = await supabase
                .from('stores')
                .select('*')
                .eq('id', prof.store_id)
                .maybeSingle();
              if (st) setStore(st as Store);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[AuthProvider] Failed to fetch profile/store:', err);
    }
  }, []);

  // Initialize session and set up auth state listener
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      // If Supabase is not configured, check for local server session
      fetch('/api/auth/me')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!mounted) return;
          if (data?.user) {
            setUser(data.user);
            setProfile(data.profile || null);
            setStore(data.store || null);
          }
          setLoading(false);
        })
        .catch(() => {
          if (mounted) setLoading(false);
        });
      return;
    }

    // Standard Supabase Auth Session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      setUser(initialSession?.user || null);

      if (initialSession) {
        fetchProfileAndStore(initialSession).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);
      if (newSession) {
        await fetchProfileAndStore(newSession);
      } else {
        setProfile(null);
        setStore(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndStore]);

  // Sign In - Uses Supabase Auth only
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass.trim(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await fetchProfileAndStore(data.session);
        return { success: true };
      }

      return { success: false, error: 'Failed to sign in. No session returned.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred' };
    }
  };

  // Sign Up & Store Creation
  const signUp = async ({
    fullName,
    email,
    password,
    storeName,
    storeSlug,
  }: SignUpParams): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            store_name: storeName.trim(),
            store_slug: storeSlug.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const createdUserId = data.user?.id || null;
      const accessToken = data.session?.access_token || null;

      // Complete Store & Profile provisioning securely on backend
      const res = await fetch('/api/auth/register-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          userId: createdUserId,
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          storeName: storeName.trim(),
          storeSlug: storeSlug.trim(),
        }),
      });

      const regData = await res.json();
      if (!res.ok) {
        return { success: false, error: regData.error || 'Registration failed' };
      }

      if (regData.profile) setProfile(regData.profile);
      if (regData.store) setStore(regData.store);
      if (regData.user) setUser(regData.user);
      if (data.session) setSession(data.session);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration error' };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setStore(null);
    }
  };

  // Reset Password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/#reset-password`,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Update Password
  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }

      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Update Profile
  const updateProfile = async (data: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = session?.access_token;
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) return { success: false, error: resData.error };
      if (resData.profile) setProfile(resData.profile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const refreshProfileAndStore = async () => {
    await fetchProfileAndStore(session);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        store,
        isAuthenticated: !!user,
        role: profile?.role || null,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfileAndStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
