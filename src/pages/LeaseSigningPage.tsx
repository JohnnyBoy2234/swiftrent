import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Home,
  User,
  PenTool
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface LeaseDetails {
  id: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string;
  monthly_rent: number;
  security_deposit: number;
  start_date: string;
  end_date: string | null;
  lease_status: string;
  lease_document_url: string | null;
  tenant_signed_at: string | null;
  landlord_signed_at: string | null;
  created_at: string;
  property_title: string;
  property_location: string;
  landlord_name: string;
  landlord_email: string;
}

export default function LeaseSigningPage() {
  const { tenancyId } = useParams<{ tenancyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lease, setLease] = useState<LeaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [documentError, setDocumentError] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (tenancyId) {
      fetchLeaseDetails();
    }
  }, [user, tenancyId]);

  const fetchLeaseDetails = async () => {
    if (!tenancyId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          *,
          properties!inner (
            title,
            location
          ),
          landlord_profile:profiles!fk_tenancies_landlord (
            display_name,
            user_id
          )
        `)
        .eq('id', tenancyId)
        .eq('tenant_id', user.id)
        .single();

      if (error) throw error;

      // Get landlord email from auth.users (we'll need to create a function for this)
      const leaseDetails: LeaseDetails = {
        id: data.id,
        property_id: data.property_id,
        landlord_id: data.landlord_id,
        tenant_id: data.tenant_id,
        monthly_rent: data.monthly_rent,
        security_deposit: data.security_deposit,
        start_date: data.start_date,
        end_date: data.end_date,
        lease_status: data.lease_status,
        lease_document_url: data.lease_document_url,
        tenant_signed_at: data.tenant_signed_at,
        landlord_signed_at: data.landlord_signed_at,
        created_at: data.created_at,
        property_title: data.properties?.title || 'Unknown Property',
        property_location: data.properties?.location || 'Address not available',
        landlord_name: data.landlord_profile?.display_name || 'Landlord',
        landlord_email: 'landlord@example.com' // We'll get this from a function later
      };

      setLease(leaseDetails);
    } catch (error: any) {
      console.error('Error fetching lease details:', error);
      toast({
        title: "Error",
        description: "Failed to load lease details",
        variant: "destructive",
      });
      navigate('/tenant-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSignLease = async () => {
    if (!lease || !user || !hasAgreed) return;

    setSigning(true);
    try {
      // Create digital signature timestamp
      const signatureTimestamp = new Date().toISOString();
      
      // Update tenancy with tenant signature
      const { error } = await supabase
        .from('tenancies')
        .update({
          tenant_signed_at: signatureTimestamp,
          lease_status: lease.lease_status === 'landlord_signed' ? 'completed' : 'tenant_signed'
        })
        .eq('id', lease.id)
        .eq('tenant_id', user.id);

      if (error) throw error;

      // Send notification to landlord
      try {
        await supabase.functions.invoke('notify-lease-signed', {
          body: { 
            tenancyId: lease.id,
            signedBy: 'tenant'
          }
        });
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Don't fail the signing process if notification fails
      }

      toast({
        title: "Lease Signed Successfully!",
        description: lease.lease_status === 'landlord_signed' 
          ? "Your lease is now fully executed and active."
          : "We have notified the landlord to complete their signature.",
      });

      // Refresh lease details
      await fetchLeaseDetails();
      
      // Navigate back to dashboard after a moment
      setTimeout(() => {
        navigate('/tenant-dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error signing lease:', error);
      toast({
        title: "Error",
        description: "Failed to sign lease. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadLease = () => {
    if (lease?.lease_document_url) {
      window.open(lease.lease_document_url, '_blank');
    } else {
      toast({
        title: "Document Not Available",
        description: "The lease document is not yet available for download.",
        variant: "destructive",
      });
    }
  };

  const getStatusInfo = () => {
    if (!lease) return { color: 'gray', text: 'Unknown' };
    
    switch (lease.lease_status) {
      case 'generated':
        return { color: 'blue', text: 'Ready for Your Signature' };
      case 'tenant_signed':
        return { color: 'orange', text: 'Awaiting Landlord Signature' };
      case 'landlord_signed':
        return { color: 'blue', text: 'Ready for Your Signature' };
      case 'completed':
        return { color: 'green', text: 'Fully Executed' };
      default:
        return { color: 'gray', text: lease.lease_status };
    }
  };

  const canSign = lease && ['generated', 'landlord_signed'].includes(lease.lease_status);
  const isCompleted = lease?.lease_status === 'completed';
  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Lease Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested lease could not be found.</p>
            <Button onClick={() => navigate('/tenant-dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/tenant-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Review and Sign Your Lease Agreement</h1>
            <p className="text-muted-foreground mt-1">{lease.property_title}</p>
          </div>
          <Badge variant={statusInfo.color === 'green' ? 'default' : 'secondary'}>
            {statusInfo.text}
          </Badge>
        </div>

        {/* Success Message */}
        {isCompleted && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Congratulations!</strong> Your lease agreement has been fully executed. 
              Both you and your landlord have signed the document.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Document Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lease Agreement Document
                </CardTitle>
                <CardDescription>
                  Review the complete lease agreement before signing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lease.lease_document_url ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">Lease Agreement PDF</p>
                            <p className="text-sm text-muted-foreground">Click to view full document</p>
                          </div>
                        </div>
                        <Button onClick={handleDownloadLease} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          View PDF
                        </Button>
                      </div>
                    </div>
                    
                    {/* Document preview would go here */}
                    <div className="border rounded-lg min-h-[500px] bg-muted/20 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Document Preview</p>
                        <p className="text-muted-foreground mb-4">
                          Click "View PDF" above to review the full lease agreement
                        </p>
                        <Button onClick={handleDownloadLease} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Open Document
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Document Not Available</p>
                    <p className="text-muted-foreground">
                      The lease document is being prepared. Please check back later.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lease Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lease Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{lease.property_title}</p>
                    <p className="text-sm text-muted-foreground">{lease.property_location}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Rent</span>
                    <span className="font-medium">R{lease.monthly_rent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Security Deposit</span>
                    <span className="font-medium">R{lease.security_deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lease Start</span>
                    <span className="font-medium">{format(new Date(lease.start_date), 'MMM dd, yyyy')}</span>
                  </div>
                  {lease.end_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Lease End</span>
                      <span className="font-medium">{format(new Date(lease.end_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{lease.landlord_name}</p>
                    <p className="text-sm text-muted-foreground">Landlord</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signing Panel */}
            {canSign && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    Digital Signature
                  </CardTitle>
                  <CardDescription>
                    Sign your lease agreement digitally
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="agree" 
                      checked={hasAgreed}
                      onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                    />
                    <label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                      I have read, understood, and agree to all the terms and conditions 
                      outlined in this lease agreement.
                    </label>
                  </div>
                  
                  <Button 
                    onClick={handleSignLease}
                    disabled={!hasAgreed || signing}
                    className="w-full"
                    size="lg"
                  >
                    {signing ? (
                      "Signing Lease..."
                    ) : (
                      <>
                        <PenTool className="h-4 w-4 mr-2" />
                        Digitally Sign Lease
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    By clicking "Digitally Sign Lease", you are providing your electronic signature 
                    and agreeing to be legally bound by this agreement.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Signature Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signature Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Your Signature</span>
                  {lease.tenant_signed_at ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Signed</span>
                    </div>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Landlord Signature</span>
                  {lease.landlord_signed_at ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Signed</span>
                    </div>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>

                {lease.tenant_signed_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    You signed on {format(new Date(lease.tenant_signed_at), 'MMM dd, yyyy \'at\' h:mm a')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}