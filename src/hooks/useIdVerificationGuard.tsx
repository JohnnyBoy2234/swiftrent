import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useIdVerificationGuard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id_verification_status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking verification status:', error);
        setVerificationStatus('unverified');
      } else {
        setVerificationStatus(data.id_verification_status);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus('unverified');
    } finally {
      setLoading(false);
    }
  };

  // Protected routes that require ID verification
  const protectedRoutes = ['/dashboard', '/properties', '/messages', '/add-property', '/list-property'];
  const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    if (!authLoading && !loading && user && isProtectedRoute) {
      if (verificationStatus === 'unverified') {
        // Redirect to ID verification with return URL
        navigate(`/id-verification?return=${encodeURIComponent(location.pathname + location.search)}`);
      }
    }
  }, [user, authLoading, loading, verificationStatus, isProtectedRoute, navigate, location]);

  return {
    verificationStatus,
    loading: loading || authLoading,
    isVerified: verificationStatus === 'verified' || verificationStatus === 'pending',
    needsVerification: verificationStatus === 'unverified'
  };
}