import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Home, 
  List, 
  Users, 
  FileText, 
  CreditCard, 
  Wrench, 
  ArrowLeft,
  ExternalLink,
  Mail,
  Link,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Property } from '@/types/dashboard';
import { LeaseSigningDialog } from '@/components/lease/LeaseSigningDialog';
import { LeaseCreationWizard } from '@/components/lease/LeaseCreationWizard';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
  tenant_id: string;
  notes?: string;
}

export default function PropertyManagement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLandlord } = useAuth();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [emailForInvite, setEmailForInvite] = useState('');
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [showLeaseDialog, setShowLeaseDialog] = useState(false);

  useEffect(() => {
    if (!user || !isLandlord) {
      navigate('/dashboard');
      return;
    }
    
    fetchProperty();
    fetchMaintenanceRequests();
  }, [user, isLandlord, id]);

  const fetchProperty = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('landlord_id', user?.id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceRequests = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_id', id)
        .eq('landlord_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaintenanceRequests(data || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!emailForInvite || !property) return;
    
    // In a real implementation, this would send an email invitation
    toast({
      title: "Invitation Sent",
      description: `Application link sent to ${emailForInvite}`,
    });
    setEmailForInvite('');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'rented':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getMaintenanceStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading property...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Property not found</h1>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Property Header */}
      <div className="flex items-start gap-4 p-6 bg-card rounded-lg border">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Home className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{property.title}</h1>
          <p className="text-muted-foreground">{property.location}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant={getStatusBadgeVariant(property.status)}>
              {property.status.toUpperCase()}
            </Badge>
            <span className="text-lg font-semibold">R{property.price.toLocaleString()}/month</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="listing" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Listing
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="leases" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Leases
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Upcoming payments will appear here</p>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    Details <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Leases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Active leases will appear here</p>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    Details <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Listing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Summary of current listing status</p>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    Details <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps Card */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Next steps</CardTitle>
                  <CardDescription>Get your property ready for tenants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => setShowLeaseDialog(true)}
                  >
                    Upload a lease
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => setActiveTab('payments')}
                  >
                    Set up payments
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Listing Tab */}
        <TabsContent value="listing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Listing Status</CardTitle>
              <CardDescription>Manage your rental advertisement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Current Status</h3>
                  <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                    {property.status === 'available' ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Listing setup</span>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Progress value={100} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">Setup complete</p>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  {property.status === 'available' ? 'View listing' : 'Activate listing'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/list-property', { state: { editProperty: property } })}
                >
                  Edit listing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Manage tenant applications for this property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No new applications</h3>
                <p className="text-muted-foreground mb-6">Applications will appear here when submitted</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter email address"
                    value={emailForInvite}
                    onChange={(e) => setEmailForInvite(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSendInvite} disabled={!emailForInvite}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send application link
                  </Button>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Link className="h-4 w-4 mr-2" />
                  Get shareable application link
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invite more renters to apply</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Print your property sheet
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leases Tab */}
        <TabsContent value="leases" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Free online lease signing</CardTitle>
                <CardDescription>Generate and sign leases digitally</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create professional lease agreements and collect signatures online.
                </p>
                <Button onClick={() => setShowLeaseDialog(true)} className="w-full">
                  Get started
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property condition report</CardTitle>
                <CardDescription>Document property condition</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create detailed property condition reports with photos and notes.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Join waitlist
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Say hello to online rent payments</CardTitle>
              <CardDescription>
                Collect rent payments automatically with our secure payment system
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <div className="p-6 bg-muted/50 rounded-lg">
                  <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Automated Collections</h3>
                  <p className="text-muted-foreground">
                    Set up automatic rent collection and never chase payments again
                  </p>
                </div>
              </div>
              
              <Button size="lg" className="w-full max-w-md">
                Start collecting rent
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Connect your bank account to get started with online payments
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>Track and manage maintenance for this property</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No maintenance requests</h3>
                  <p className="text-muted-foreground">
                    Maintenance requests from tenants will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getMaintenanceStatusIcon(request.status)}
                              <h4 className="font-semibold">{request.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {request.category}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {request.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(request.created_at).toLocaleDateString()}</span>
                              <Badge 
                                variant={
                                  request.priority === 'high' ? 'destructive' :
                                  request.priority === 'medium' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {request.priority} priority
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lease Creation Wizard */}
      {showLeaseDialog && property && (
        <LeaseCreationWizard
          isOpen={showLeaseDialog}
          onClose={() => setShowLeaseDialog(false)}
          propertyId={property.id}
          onLeaseCreated={() => {
            setShowLeaseDialog(false);
            toast({
              title: "Success",
              description: "Lease created successfully and ready for signing",
            });
          }}
        />
      )}
    </div>
  );
}