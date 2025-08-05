import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, FileCheck, CreditCard, UserCheck } from 'lucide-react';
import { ScreeningProfile } from '../MultiStepScreeningForm';

interface ScreeningReportsStepProps {
  formData: ScreeningProfile;
  updateFormData: (updates: Partial<ScreeningProfile>) => void;
  onNext: () => void;
  onSave: () => void;
}

export default function ScreeningReportsStep({ formData, updateFormData }: ScreeningReportsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-2xl font-bold mb-2">Background & Credit Checks</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          To complete your application, we need your consent to perform background and credit checks. 
          This helps landlords make informed decisions and ensures a safe rental experience for everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <FileCheck className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h4 className="font-semibold mb-2">Background Check</h4>
            <p className="text-sm text-muted-foreground">
              Criminal record and identity verification to ensure safety
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h4 className="font-semibold mb-2">Credit Check</h4>
            <p className="text-sm text-muted-foreground">
              Credit history and score to assess financial reliability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <UserCheck className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h4 className="font-semibold mb-2">Reference Verification</h4>
            <p className="text-sm text-muted-foreground">
              Verification of employment and previous rental history
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consent Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Your Privacy:</strong> All checks are conducted by licensed agencies and your information 
              is handled securely in accordance with South African privacy laws. Reports are only shared with 
              the property owner for this specific application.
            </AlertDescription>
          </Alert>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="screening-consent"
              checked={formData.screening_consent}
              onCheckedChange={(checked) => updateFormData({ 
                screening_consent: checked as boolean,
                screening_consent_date: checked ? new Date().toISOString() : undefined
              })}
            />
            <div className="flex-1">
              <Label 
                htmlFor="screening-consent" 
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I authorize EasyRent and the landlord to perform background and credit checks, 
                verify my employment and rental history, and contact my references as part of 
                this rental application process. *
              </Label>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            * This consent is required to submit your application and can be withdrawn at any time 
            by contacting us directly.
          </p>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Note:</strong> Screening checks typically take 24-48 hours to complete. 
          You will be notified once the reports are ready and your application is fully processed.
        </AlertDescription>
      </Alert>
    </div>
  );
}