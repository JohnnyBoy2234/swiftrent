import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Home, MessageSquare, BarChart3, Eye, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyCard } from '@/components/dashboard/PropertyCard';
import { Property, Tenancy } from '@/types/dashboard';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
  property_id: string;
  properties: {
    title: string;
  };
}

interface Application {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  status: string;
  created_at: string;
}

interface PropertyWithCounts extends Property {
  inquiriesCount: number;
  applicationsCount: number;
  activeTenancy?: Tenancy;
}

export default function Dashboard() {
  const { user, isLandlord, signOut } = useAuth();
  const [propertiesWithCounts, setPropertiesWithCounts] = useState<PropertyWithCounts[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isLandlord) {
      navigate('/');
      return;
    }

    fetchData();
  }, [user, isLandlord, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch inquiries
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select(`
          *,
          properties (
            title
          )
        `)
        .in('property_id', (propertiesData || []).map(p => p.id))
        .order('created_at', { ascending: false });

      if (inquiriesError) throw inquiriesError;
      setInquiries(inquiriesData || []);

      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);

      // Fetch tenancies
      const { data: tenanciesData, error: tenanciesError } = await supabase
        .from('tenancies')
        .select(`
          *,
          properties!inner (
            title
          ),
          tenant_profile:profiles!fk_tenancies_tenant (
            display_name,
            user_id
          )
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (tenanciesError) throw tenanciesError;
      
      // Transform the data to match our interface
      const transformedTenancies = (tenanciesData || []).map((tenancy: any) => ({
        ...tenancy,
        property_title: tenancy.properties?.title || 'Unknown Property',
        tenant_name: tenancy.tenant_profile?.display_name || 'Unknown Tenant',
        tenant_email: '' // We'll need to get this separately if needed
      }));
      
      setTenancies(transformedTenancies);

      // Combine properties with counts and active tenancies
      const propertiesWithCountsData = (propertiesData || []).map(property => {
        const propertyInquiries = (inquiriesData || []).filter(inquiry => inquiry.property_id === property.id);
        const propertyApplications = (applicationsData || []).filter(app => app.property_id === property.id);
        const activeTenancy = transformedTenancies.find(tenancy => 
          tenancy.property_id === property.id && tenancy.status === 'active'
        );

        return {
          ...property,
          inquiriesCount: propertyInquiries.length,
          applicationsCount: propertyApplications.length,
          activeTenancy
        };
      });

      setPropertiesWithCounts(propertiesWithCountsData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    totalProperties: propertiesWithCounts.length,
    availableProperties: propertiesWithCounts.filter(p => p.status === 'available').length,
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter(i => i.status === 'pending').length,
    activeTenancies: tenancies.filter(t => t.status === 'active').length,
    totalApplications: applications.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Rental Manager</h1>
            <p className="text-muted-foreground">Manage your properties like a pro</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/dashboard/add-property')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalProperties}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.availableProperties}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.activeTenancies}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-tertiary">{stats.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalInquiries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.pendingInquiries}</div>
            </CardContent>
          </Card>
        </div>

        {/* Property Cards */}
        <div className="space-y-6">
          {propertiesWithCounts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Properties Yet</CardTitle>
                <CardDescription>Get started by adding your first property</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Button onClick={() => navigate('/dashboard/add-property')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {propertiesWithCounts.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  inquiriesCount={property.inquiriesCount}
                  applicationsCount={property.applicationsCount}
                  activeTenancy={property.activeTenancy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}