import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useViewings } from '@/hooks/useViewings';
import { useAuth } from '@/hooks/useAuth';
import MultiStepScreeningForm from './MultiStepScreeningForm';
import ViewingWorkflow from '../viewing/ViewingWorkflow';

interface ApplicationAccessGuardProps {
  propertyId: string;
  landlordId: string;
  tenantId?: string;
  onApplicationComplete?: () => void;
  onCancel?: () => void;
}

const ApplicationAccessGuard: React.FC<ApplicationAccessGuardProps> = ({
  propertyId,
  landlordId,
  tenantId,
  onApplicationComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const { getViewingStatus, checkApplicationAccess } = useViewings();
  const [viewingStatus, setViewingStatus] = useState<any>(null);
  const [canAccessApplication, setCanAccessApplication] = useState(false);
  const [loading, setLoading] = useState(true);

  const effectiveTenantId = tenantId || user?.id;

  useEffect(() => {
    checkStatus();
  }, [propertyId, landlordId, effectiveTenantId]);

  const checkStatus = async () => {
    if (!effectiveTenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get viewing status
      const viewing = await getViewingStatus(propertyId, effectiveTenantId);
      setViewingStatus(viewing);

      // Check if application access is granted
      const hasAccess = await checkApplicationAccess(propertyId, effectiveTenantId);
      setCanAccessApplication(hasAccess);
    } catch (error) {
      console.error('Error checking status:', error);
      setViewingStatus(null);
      setCanAccessApplication(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!viewingStatus) {
      return {
        status: 'no-viewing',
        title: 'Schedule a Viewing First',
        message: 'You need to schedule and complete a property viewing before applying.',
        color: 'blue',
        icon: Calendar
      };
    }

    if (viewingStatus.status === 'requested') {
      return {
        status: 'viewing-requested',
        title: 'Viewing Requested',
        message: 'Your viewing request has been sent. Wait for the landlord to confirm.',
        color: 'yellow',
        icon: Clock
      };
    }

    if (viewingStatus.status === 'scheduled') {
      return {
        status: 'viewing-scheduled',
        title: 'Viewing Scheduled',
        message: 'Your viewing is scheduled. Complete it to proceed with the application.',
        color: 'blue',
        icon: Calendar
      };
    }

    if (viewingStatus.status === 'completed' && !viewingStatus.viewing_confirmed) {
      return {
        status: 'awaiting-confirmation',
        title: 'Awaiting Landlord Confirmation',
        message: 'Your viewing is complete. Waiting for the landlord to confirm.',
        color: 'orange',
        icon: Clock
      };
    }

    if (viewingStatus.viewing_confirmed && !viewingStatus.application_sent) {
      return {
        status: 'awaiting-application',
        title: 'Awaiting Application Access',
        message: 'Viewing confirmed. Waiting for the landlord to send the application.',
        color: 'purple',
        icon: Clock
      };
    }

    if (canAccessApplication) {
      return {
        status: 'application-available',
        title: 'Application Available',
        message: 'You can now proceed with your rental application.',
        color: 'green',
        icon: CheckCircle
      };
    }

    return {
      status: 'unknown',
      title: 'Status Unknown',
      message: 'Please contact the landlord for assistance.',
      color: 'gray',
      icon: AlertCircle
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusDisplay();

  // If application is available, show the form
  if (canAccessApplication && statusInfo.status === 'application-available') {
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  {statusInfo.title}
                </p>
                <p className="text-sm text-green-600">
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <MultiStepScreeningForm
          propertyId={propertyId}
          viewingId={viewingStatus?.id}
          onComplete={onApplicationComplete}
          onCancel={onCancel}
        />
      </div>
    );
  }

  // Show status and viewing workflow if needed
  return (
    <div className="space-y-4">
      <Card className={`border-${statusInfo.color}-200`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={`p-3 rounded-full bg-${statusInfo.color}-100`}>
                <statusInfo.icon className={`h-8 w-8 text-${statusInfo.color}-600`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{statusInfo.title}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {statusInfo.message}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Workflow Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Schedule a property viewing</li>
                    <li>Complete the viewing with the landlord</li>
                    <li>Wait for landlord confirmation</li>
                    <li>Wait for landlord to send application</li>
                    <li>Submit your rental application</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show viewing workflow if no viewing exists or viewing needs to be completed */}
      {(!viewingStatus || statusInfo.status === 'no-viewing') && effectiveTenantId && (
        <Card>
          <CardContent className="pt-6">
            <ViewingWorkflow
              propertyId={propertyId}
              propertyTitle="Property"
              tenantId={effectiveTenantId}
              onViewingCompleted={checkStatus}
            />
          </CardContent>
        </Card>
      )}

      {onCancel && (
        <div className="text-center">
          <Button variant="outline" onClick={onCancel}>
            Back to Property
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApplicationAccessGuard;