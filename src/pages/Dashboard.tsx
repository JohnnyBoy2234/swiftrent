import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Home, MessageSquare, BarChart3, Eye, Users, Calendar, MoreHorizontal, PenTool } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Property, Tenancy } from '@/types/dashboard';
import { useLandlordNotifications } from '@/hooks/useLandlordNotifications';
import { SignedLeasesList } from '@/components/lease/SignedLeasesList';

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

type PropertyFilter = 'all' | 'for-rent' | 'off-market';

export default function Dashboard() {
  const { user, isLandlord, signOut } = useAuth();
  const [propertiesWithCounts, setPropertiesWithCounts] = useState<PropertyWithCounts[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PropertyFilter>('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications, pendingSignatures, markAsRead } = useLandlordNotifications();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isLandlord) {
      navigate('/tenant-dashboard');
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

  const filteredProperties = propertiesWithCounts.filter(property => {
    switch (filter) {
      case 'for-rent':
        return property.status === 'available';
      case 'off-market':
        return property.status === 'rented' || property.status === 'occupied';
      default:
        return true;
    }
  });

  const getPropertyStatus = (property: PropertyWithCounts) => {
    if (property.status === 'available') return 'For rent';
    if (property.status === 'rented' || property.status === 'occupied') return 'Off-market';
    return property.status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'For rent':
        return 'default';
      case 'Off-market':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">SwiftRent</h1>
          </div>
          
          <nav className="space-y-2">
            <Button variant="default" className="w-full justify-start gap-3">
              <Home className="w-5 h-5" />
              Properties
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => navigate('/messages')}>
              <MessageSquare className="w-5 h-5" />
              Messages
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <BarChart3 className="w-5 h-5" />
              Payments
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Eye className="w-5 h-5" />
              Alerts
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Properties</h1>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/dashboard/add-property')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add a property
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Notifications for Pending Signatures */}
          {pendingSignatures.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Action Required - Lease Signatures Pending
                </CardTitle>
                <CardDescription className="text-orange-700">
                  The following leases have been signed by tenants and are ready for your signature.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingSignatures.map((signature) => (
                    <div key={signature.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">{signature.property_title}</p>
                        <p className="text-sm text-muted-foreground">
                          Tenant: {signature.tenant_name} • Monthly Rent: R{signature.monthly_rent.toLocaleString()}
                        </p>
                        <p className="text-xs text-orange-600">
                          Signed by tenant on {new Date(signature.tenant_signed_at!).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          navigate(`/landlord-lease-signing/${signature.id}`);
                          markAsRead(signature.id);
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Sign & Finalize
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Filters */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="rounded-full"
            >
              All ({propertiesWithCounts.length})
            </Button>
            <Button
              variant={filter === 'for-rent' ? 'default' : 'outline'}
              onClick={() => setFilter('for-rent')}
              className="rounded-full"
            >
              For rent ({propertiesWithCounts.filter(p => p.status === 'available').length})
            </Button>
            <Button
              variant={filter === 'off-market' ? 'default' : 'outline'}
              onClick={() => setFilter('off-market')}
              className="rounded-full"
            >
              Off-market ({propertiesWithCounts.filter(p => p.status === 'rented' || p.status === 'occupied').length})
            </Button>
          </div>

          {/* Properties Table */}
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
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>August rent</TableHead>
                    <TableHead>Potential tenants</TableHead>
                    <TableHead>Lease</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow
                      key={property.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/manage-property/${property.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/manage-property/${property.id}`);
                        }
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{property.title}</div>
                            <Badge variant={getStatusBadgeVariant(getPropertyStatus(property))} className="mt-1">
                              {getPropertyStatus(property)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {property.status === 'available' ? (
                          <span className="font-medium">R{property.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{property.inquiriesCount} inquiries</div>
                          <div className="text-muted-foreground">{property.applicationsCount} applications</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {property.activeTenancy?.lease_status ? (
                          <Badge variant="outline">
                            {property.activeTenancy.lease_status === 'signed' ? 'Active' : 
                             property.activeTenancy.lease_status === 'pending' ? 'Pending' : 'Draft'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/manage-property/${property.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
          {/* Signed Leases */}
          <div className="mt-8">
            <SignedLeasesList role="landlord" />
          </div>
        </div>
      </div>
    </div>
  );
}