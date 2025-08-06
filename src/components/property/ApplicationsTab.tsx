import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Mail, 
  Link, 
  Eye, 
  Check, 
  X, 
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { useLandlordApplications, ApplicationWithTenant } from '@/hooks/useLandlordApplications';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ApplicationsTabProps {
  propertyId: string;
  onStartLease: (tenantId: string, tenantName: string) => void;
}

export function ApplicationsTab({ propertyId, onStartLease }: ApplicationsTabProps) {
  const { applications, loading, updateApplicationStatus } = useLandlordApplications(propertyId);
  const { toast } = useToast();
  const [emailForInvite, setEmailForInvite] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithTenant | null>(null);

  const handleSendInvite = async () => {
    if (!emailForInvite) return;
    
    // In a real implementation, this would send an email invitation
    toast({
      title: "Invitation Sent",
      description: `Application link sent to ${emailForInvite}`,
    });
    setEmailForInvite('');
  };

  const handleAcceptApplication = async (application: ApplicationWithTenant) => {
    const success = await updateApplicationStatus(application.id, 'accepted');
    if (success) {
      const tenantName = application.screening_profile 
        ? `${application.screening_profile.first_name} ${application.screening_profile.last_name}`
        : application.tenant_profile?.display_name || 'Tenant';
      
      onStartLease(application.tenant_id, tenantName);
    }
  };

  const handleDeclineApplication = async (applicationId: string) => {
    await updateApplicationStatus(applicationId, 'declined');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'declined':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const renderApplicationDetails = (application: ApplicationWithTenant) => {
    if (!application.screening_profile) {
      return (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Screening profile not available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <p>{application.screening_profile.first_name} {application.screening_profile.last_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Application Date</label>
            <p>{format(new Date(application.created_at), 'MMM dd, yyyy')}</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Screening Status</label>
          <Badge variant={application.screening_profile.is_complete ? 'default' : 'secondary'} className="ml-2">
            {application.screening_profile.is_complete ? 'Complete' : 'Incomplete'}
          </Badge>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            This tenant has completed their screening profile and is ready for review.
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>Manage tenant applications for this property</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {applications.length === 0 ? (
            <>
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
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{applications.length} Application{applications.length > 1 ? 's' : ''}</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter email address"
                    value={emailForInvite}
                    onChange={(e) => setEmailForInvite(e.target.value)}
                    className="w-64"
                  />
                  <Button onClick={handleSendInvite} disabled={!emailForInvite} variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Invite more
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {applications.map((application) => {
                  const tenantName = application.screening_profile 
                    ? `${application.screening_profile.first_name} ${application.screening_profile.last_name}`
                    : application.tenant_profile?.display_name || 'Unknown Tenant';

                  return (
                    <Card key={application.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{tenantName}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Applied {format(new Date(application.created_at), 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant={getStatusBadgeVariant(application.status)}>
                                {application.status.toUpperCase()}
                              </Badge>
                              {application.screening_profile?.is_complete && (
                                <Badge variant="outline">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Screening Complete
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Full Application
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Application Details - {tenantName}</DialogTitle>
                                  <DialogDescription>
                                    Review the complete application and screening information
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedApplication && renderApplicationDetails(selectedApplication)}
                              </DialogContent>
                            </Dialog>

                            {application.status === 'pending' && (
                              <>
                                <Button 
                                  onClick={() => handleAcceptApplication(application)}
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Accept & Start Lease
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeclineApplication(application.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}