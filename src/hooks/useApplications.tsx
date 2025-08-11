import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';


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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);


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
    if (!user) return null;

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
    applications,
    loading,
    submitApplication,
    hasAppliedToProperty,
    refreshData: () => {
      fetchApplications();
    }
  };
};