import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../lib/types';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  login: (username: string, password: string, role?: UserRole) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  }

  async function login(username: string, password: string, role: UserRole = 'nakes'): Promise<{ error: string | null }> {
    const email = `${username.toLowerCase().replace(/\s+/g, '.')}@mentawai.id`;

    // Try sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInData?.user) return { error: null };

    if (signInError) {
      // If not found, auto-register
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, display_name: username } },
      });

      if (signUpError) return { error: signUpError.message };
      if (!signUpData?.user) return { error: 'Gagal membuat akun.' };

      // Create profile
      await supabase.from('profiles').insert({
        id: signUpData.user.id,
        username: username.toLowerCase(),
        display_name: username,
        role,
        faskes_name: role === 'nakes' ? 'Puskesmas Mentawai' : 'Dinkes Mentawai',
      });
    }

    return { error: null };
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
