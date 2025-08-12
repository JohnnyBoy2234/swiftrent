import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  FileText, 
  Home, 
  MessageSquare, 
  Eye, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Download
} from 'lucide-react';
import { useTenantNotifications } from '@/hooks/useTenantNotifications';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TenantApplicationsSection } from '@/components/tenant/TenantApplicationsSection';
import { supabase } from '@/integrations/supabase/client';
import { SignedLeasesList } from '@/components/lease/SignedLeasesList';

export default function TenantDashboard() {
  const { user, isLandlord, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    notifications, 
    pendingLeases, 
    loading, 
    unreadCount, 
    markAsRead 
  } = useTenantNotifications();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isLandlord) {
      navigate('/dashboard');
      return;
    }
  }, [user, isLandlord, navigate]);

  const handleViewLease = (tenancyId: string) => {
    navigate(`/lease-signing/${tenancyId}`);
  };

  const handleDownloadLease = async (leaseRef: string, propertyTitle: string) => {
    try {
      if (!leaseRef) return;
      if (leaseRef.startsWith('http')) {
        const link = document.createElement('a');
        link.href = leaseRef;
        link.download = `Lease_Agreement_${propertyTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const { data, error } = await supabase.storage
        .from('lease-documents')
        .download(leaseRef);
      if (error) throw error;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Lease_Agreement_${propertyTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.type === 'lease_ready') {
      navigate(`/lease-signing/${notification.tenancyId}`);
    }
  };

  const getLeaseStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting_tenant_signature':
        return <Badge variant="secondary">Awaiting Your Signature</Badge>;
      case 'awaiting_landlord_signature':
        return <Badge variant="outline">Awaiting Landlord Signature</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active & Signed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-earth-light/20 to-success-green/5">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gradient-to-b from-white to-ocean-blue/10 shadow-medium">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-success-green to-ocean-blue rounded flex items-center justify-center shadow-soft">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">SwiftRent</h1>
          </div>
          
          <nav className="space-y-2">
            <Button variant="default" className="w-full justify-start gap-3 bg-gradient-to-r from-success-green to-success-green-glow hover:from-success-green-dark hover:to-success-green shadow-soft">
              <Home className="w-5 h-5" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-ocean-blue/10 hover:text-ocean-blue-dark" onClick={() => navigate('/tenant/messages')}>
              <MessageSquare className="w-5 h-5" />
              Messages
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => {
              const el = document.getElementById('leases-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
               <FileText className="w-5 h-5" />
               My Leases
             </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <DollarSign className="w-5 h-5" />
              Payments
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Notifications Section */}
          {notifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Action Required
              </h2>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Alert 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${!notification.isRead ? 'border-orange-200 bg-orange-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Bell className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message} from {notification.landlordName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Property: {notification.propertyAddress}
                          </p>
                        </div>
                        <Button size="sm" className="ml-4">
                          View Lease
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Pending Leases Section */}
          <div className="mb-8" id="leases-section">
            <h2 className="text-xl font-semibold mb-4">Pending Lease Actions</h2>
            {pendingLeases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending lease signatures at this time.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingLeases.map((lease) => (
                  <Card key={lease.id} className="border-l-4 border-l-earth-warm bg-gradient-to-r from-white to-earth-light/30 shadow-medium">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{lease.property_title}</CardTitle>
                          <CardDescription>{lease.property_location}</CardDescription>
                        </div>
                        {getLeaseStatusBadge(lease.lease_status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Rent</p>
                          <p className="font-semibold">R{lease.monthly_rent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Security Deposit</p>
                          <p className="font-semibold">R{lease.security_deposit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Lease Start</p>
                          <p className="font-semibold">{format(new Date(lease.start_date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          From: {lease.landlord_name} • Created: {format(new Date(lease.created_at), 'MMM dd, yyyy')}
                        </p>
                        {lease.lease_status === 'completed' ? (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleDownloadLease((lease as any).lease_document_path || lease.lease_document_url!, lease.property_title)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                            <Button>
                              Make First Payment & Security Deposit
                            </Button>
                          </div>
                        ) : lease.lease_status === 'awaiting_tenant_signature' ? (
                          <Button onClick={() => handleViewLease(lease.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review & Sign
                          </Button>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Awaiting landlord signature
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Signed Leases */}
          <div className="mb-8">
            <SignedLeasesList role="tenant" />
          </div>

          {/* My Applications */}
          <TenantApplicationsSection />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Browse Properties
                </CardTitle>
                <CardDescription>Find your next rental home</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/properties')} className="w-full">
                  View Available Properties
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
                <CardDescription>Communicate with landlords</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/tenant/messages')} variant="outline" className="w-full">
                  Open Messages
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Profile
                </CardTitle>
                <CardDescription>Update your tenant profile</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
