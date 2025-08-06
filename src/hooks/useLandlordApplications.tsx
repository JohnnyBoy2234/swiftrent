import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ApplicationWithTenant {
  id: string;
  tenant_id: string;
  landlord_id: string;
  property_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  tenant_profile?: {
    display_name: string;
    user_id: string;
  };
  screening_profile?: {
    first_name: string;
    last_name: string;
    is_complete: boolean;
    created_at: string;
  };
}

export const useLandlordApplications = (propertyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationWithTenant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && propertyId) {
      fetchApplications();
    }
  }, [user, propertyId]);

  const fetchApplications = async () => {
    if (!user || !propertyId) return;

    setLoading(true);
    try {
      // First get applications
      const { data: applicationsData, error } = await supabase
        .from('applications')
        .select('*')
        .eq('property_id', propertyId)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Then fetch related data for each application
      const applicationsWithProfiles = await Promise.all(
        (applicationsData || []).map(async (app) => {
          const [tenantProfile, screeningProfile] = await Promise.all([
            supabase
              .from('profiles')
              .select('display_name, user_id')
              .eq('user_id', app.tenant_id)
              .maybeSingle(),
            supabase
              .from('screening_profiles')
              .select('first_name, last_name, is_complete, created_at')
              .eq('user_id', app.tenant_id)
              .maybeSingle()
          ]);

          return {
            ...app,
            tenant_profile: tenantProfile.data,
            screening_profile: screeningProfile.data
          };
        })
      );

      setApplications(applicationsWithProfiles);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .eq('landlord_id', user?.id);

      if (error) throw error;

      // Refresh applications
      await fetchApplications();
      
      toast({
        title: "Success",
        description: `Application ${status === 'accepted' ? 'accepted' : 'declined'} successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    applications,
    loading,
    fetchApplications,
    updateApplicationStatus,
  };
};