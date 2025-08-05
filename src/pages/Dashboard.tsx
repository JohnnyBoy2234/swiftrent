import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Home, MessageSquare, BarChart3, Eye, Edit, Trash2, Users, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TenancyCard } from '@/components/tenancy/TenancyCard';
import { TenancyForm } from '@/components/tenancy/TenancyForm';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  status: string;
  created_at: string;
  featured: boolean;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
  properties: {
    title: string;
  };
}

interface Tenancy {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  lease_document_url?: string;
  notes?: string;
  property_title: string;
  tenant_name: string;
  tenant_email: string;
}

export default function Dashboard() {
  const { user, isLandlord, signOut } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenancyFormOpen, setTenancyFormOpen] = useState(false);
  const [editingTenancy, setEditingTenancy] = useState<Tenancy | null>(null);
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
      setProperties(propertiesData || []);

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

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.filter(p => p.id !== propertyId));
      toast({
        title: "Property deleted",
        description: "The property has been successfully deleted."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const updateInquiryStatus = async (inquiryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', inquiryId);

      if (error) throw error;

      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status } : inquiry
      ));

      toast({
        title: "Inquiry updated",
        description: `Inquiry marked as ${status}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleEditTenancy = (tenancy: Tenancy) => {
    setEditingTenancy(tenancy);
    setTenancyFormOpen(true);
  };

  const handleCreateTenancy = () => {
    setEditingTenancy(null);
    setTenancyFormOpen(true);
  };

  const handleTenancyFormSuccess = () => {
    fetchData();
  };

  const handleViewLease = (url: string) => {
    window.open(url, '_blank');
  };

  const handleGenerateLease = () => {
    navigate('/dashboard/lease-generator');
  };

  const stats = {
    totalProperties: properties.length,
    availableProperties: properties.filter(p => p.status === 'available').length,
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter(i => i.status === 'pending').length,
    activeTenancies: tenancies.filter(t => t.status === 'active').length,
    totalTenancies: tenancies.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Landlord Dashboard</h1>
            <p className="text-muted-foreground">Manage your properties and inquiries</p>
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
              <CardTitle className="text-sm font-medium">Total Tenancies</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-tertiary">{stats.totalTenancies}</div>
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

        {/* Tabs */}
        <Tabs defaultValue="properties" className="w-full">
          <TabsList>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="tenancies">Tenancies</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Your Properties</CardTitle>
                <CardDescription>Manage your property listings</CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No properties listed yet</p>
                    <Button onClick={() => navigate('/dashboard/add-property')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Property
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{property.title}</h3>
                            {property.featured && <Badge variant="secondary">Featured</Badge>}
                            <Badge variant={
                              property.status === 'available' ? 'default' :
                              property.status === 'rented' ? 'destructive' : 'secondary'
                            }>
                              {property.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{property.location}</p>
                          <p className="text-sm">
                            R{property.price.toLocaleString()}/month • {property.bedrooms} bed • {property.bathrooms} bath
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/edit-property/${property.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{property.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteProperty(property.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenancies">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Tenancies</CardTitle>
                    <CardDescription>Manage your current tenants and lease agreements</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleGenerateLease} 
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Generate Lease
                    </Button>
                    <Button onClick={handleCreateTenancy} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Tenancy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tenancies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No tenancies created yet</p>
                    <Button onClick={handleCreateTenancy}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Tenancy
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tenancies.map((tenancy) => (
                      <TenancyCard
                        key={tenancy.id}
                        tenancy={tenancy}
                        onEdit={handleEditTenancy}
                        onViewLease={handleViewLease}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle>Property Inquiries</CardTitle>
                <CardDescription>Manage inquiries from potential tenants</CardDescription>
              </CardHeader>
              <CardContent>
                {inquiries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No inquiries yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{inquiry.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {inquiry.properties?.title}
                            </p>
                          </div>
                          <Badge variant={
                            inquiry.status === 'pending' ? 'default' :
                            inquiry.status === 'responded' ? 'secondary' : 'outline'
                          }>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                          <p><strong>Email:</strong> {inquiry.email}</p>
                          {inquiry.phone && <p><strong>Phone:</strong> {inquiry.phone}</p>}
                        </div>
                        <p className="text-sm mb-4 p-3 bg-muted rounded">{inquiry.message}</p>
                        <div className="flex gap-2">
                          {inquiry.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateInquiryStatus(inquiry.id, 'responded')}
                            >
                              Mark as Responded
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateInquiryStatus(inquiry.id, 'closed')}
                          >
                            Close Inquiry
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tenancy Form Modal */}
        <TenancyForm
          isOpen={tenancyFormOpen}
          onClose={() => {
            setTenancyFormOpen(false);
            setEditingTenancy(null);
          }}
          onSuccess={handleTenancyFormSuccess}
          tenancy={editingTenancy}
        />
      </div>
    </div>
  );
}