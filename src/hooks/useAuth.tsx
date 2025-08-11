import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, role?: 'tenant' | 'landlord') => Promise<{ error: any; isNewUser?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: (role?: 'tenant' | 'landlord') => Promise<{ error: any }>;
  signInWithProvider: (provider: 'google' | 'apple' | 'facebook', role?: 'tenant' | 'landlord') => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLandlord: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLandlord, setIsLandlord] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check user role
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setIsLandlord(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'landlord')
        .single();
      
      setIsLandlord(!!data);
    } catch (error) {
      setIsLandlord(false);
    }
  };

  const signUp = async (email: string, password: string, role: 'tenant' | 'landlord' = 'tenant') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    });
    
    if (error) {
      return { error, isNewUser: false };
    }

    if (data.user) {
      try {
        // Create user role record
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: role
        });
        
        // Create user profile (email_verified defaults to false)
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          display_name: data.user.email?.split('@')[0] || 'User',
          email_verified: false
        });

        // Send verification email
        await supabase.functions.invoke('send-verification-email', {
          body: {
            email: data.user.email,
            userId: data.user.id
          }
        });

      } catch (roleError) {
        console.error('Error creating user role/profile or sending verification email:', roleError);
        // Don't fail signup if role creation fails, but log the error
      }
    }
    
    return { error: null, isNewUser: true };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { error };
    }

    // Check if user is verified
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('user_id', data.user.id)
        .single();

      if (!profile?.email_verified) {
        // Sign out the user since they're not verified
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Please verify your email before signing in. Check your inbox for the verification link.',
            name: 'EmailNotVerified'
          } 
        };
      }
    }
    
    return { error: null };
  };

  const signInWithProvider = async (provider: 'google' | 'apple' | 'facebook', role: 'tenant' | 'landlord' = 'tenant') => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          role: role,
          is_signup: 'true'
        }
      }
    });
    return { error };
  };

  const signInWithGoogle = async (role: 'tenant' | 'landlord' = 'tenant') => signInWithProvider('google', role);

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email_verified')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userError || !userData) {
        return { error: { message: 'User not found' } };
      }

      if (userData.email_verified) {
        return { error: { message: 'Email is already verified' } };
      }

      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: email,
          userId: userData.user_id,
          isResend: true
        }
      });

      return { error };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithProvider,
    resetPassword,
    resendVerificationEmail,
    signOut,
    isLandlord
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}