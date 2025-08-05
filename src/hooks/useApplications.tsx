import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ScreeningDetails {
  id: string;
  user_id: string;
  full_name: string;
  id_number: string;
  phone: string;
  employment_status: string;
  job_title?: string;
  company_name?: string;
  net_monthly_income?: number;
  current_address?: string;
  reason_for_moving?: string;
  previous_landlord_name?: string;
  previous_landlord_contact?: string;
  consent_given: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  tenant_id: string;
  landlord_id: string;
  property_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useApplications = () => {
  const { user } = useAuth();
  const [isScreened, setIsScreened] = useState(false);
  const [screeningDetails, setScreeningDetails] = useState<ScreeningDetails | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkScreeningStatus();
      fetchApplications();
    }
  }, [user]);

  const checkScreeningStatus = async () => {
    if (!user) return;

    try {
      // Check if user is screened
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_tenant_screened')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      setIsScreened(profile.is_tenant_screened);

      // If screened, fetch screening details
      if (profile.is_tenant_screened) {
        const { data: screening, error: screeningError } = await supabase
          .from('screening_details')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (screeningError) throw screeningError;
        setScreeningDetails(screening);
      }
    } catch (error) {
      console.error('Error checking screening status:', error);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const submitApplication = async (propertyId: string, landlordId: string) => {
    if (!user || !isScreened) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          tenant_id: user.id,
          landlord_id: landlordId,
          property_id: propertyId
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh applications list
      await fetchApplications();
      return data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasAppliedToProperty = (propertyId: string) => {
    return applications.some(app => app.property_id === propertyId);
  };

  return {
    isScreened,
    screeningDetails,
    applications,
    loading,
    submitApplication,
    hasAppliedToProperty,
    refreshData: () => {
      checkScreeningStatus();
      fetchApplications();
    }
  };
};