import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useViewings } from '@/hooks/useViewings';
import { useAuth } from '@/hooks/useAuth';
import MultiStepScreeningForm from './MultiStepScreeningForm';

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
  const { getCompletedViewing } = useViewings();
  const [hasCompletedViewing, setHasCompletedViewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedViewing, setCompletedViewing] = useState<any>(null);

  const effectiveTenantId = tenantId || user?.id;

  useEffect(() => {
    checkViewingStatus();
  }, [propertyId, landlordId, effectiveTenantId]);

  const checkViewingStatus = async () => {
    if (!effectiveTenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const viewing = await getCompletedViewing(propertyId, effectiveTenantId);
      setCompletedViewing(viewing);
      setHasCompletedViewing(!!viewing);
    } catch (error) {
      console.error('Error checking viewing status:', error);
      setHasCompletedViewing(false);
    } finally {
      setLoading(false);
    }
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

  // If viewing is completed, allow access to application
  if (hasCompletedViewing) {
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Viewing Completed - Application Access Granted
                </p>
                <p className="text-sm text-green-600">
                  Your viewing has been confirmed. You can now proceed with the rental application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <MultiStepScreeningForm
          propertyId={propertyId}
          viewingId={completedViewing?.id}
          onComplete={onApplicationComplete}
          onCancel={onCancel}
        />
      </div>
    );
  }

  // If no completed viewing, show access denied message
  return (
    <Card className="border-yellow-200">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Application Access Pending</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You can access the rental application after your property viewing is completed and confirmed by the landlord.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Schedule a property viewing with the landlord</li>
                  <li>Complete the viewing</li>
                  <li>Wait for the landlord to confirm completion</li>
                  <li>Access and submit your rental application</li>
                </ol>
              </div>
            </div>
          </div>

          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Back to Property
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationAccessGuard;