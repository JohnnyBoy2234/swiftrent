import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScreeningFormData {
  full_name: string;
  id_number: string;
  phone: string;
  employment_status: string;
  job_title?: string;
  company_name?: string;
  net_monthly_income?: number;
  current_address?: string;
  reason_for_moving?: string;
  previous_landlord_name?: string;
  previous_landlord_contact?: string;
  consent_given: boolean;
}

interface TenantScreeningFormProps {
  propertyId: string;
  landlordId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function TenantScreeningForm({ 
  propertyId, 
  landlordId, 
  onComplete, 
  onCancel 
}: TenantScreeningFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ScreeningFormData>({
    defaultValues: {
      full_name: '',
      consent_given: false
    }
  });

  const employmentStatus = watch('employment_status');
  const consentGiven = watch('consent_given');

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ScreeningFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Save screening details
      const { error: screeningError } = await supabase
        .from('screening_details')
        .insert({
          user_id: user.id,
          ...data
        });

      if (screeningError) throw screeningError;

      // Update profile to mark as screened
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_tenant_screened: true })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Submit application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          tenant_id: user.id,
          landlord_id: landlordId,
          property_id: propertyId
        });

      if (applicationError) throw applicationError;

      toast({
        title: "Application submitted successfully",
        description: "Your screening details have been saved and your application has been sent to the landlord."
      });

      onComplete();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        variant: "destructive",
        title: "Error submitting application",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                {...register('full_name', { required: 'Full name is required' })}
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="id_number">South African ID or Passport Number</Label>
              <Input
                {...register('id_number', { required: 'ID/Passport number is required' })}
                placeholder="Enter your ID or passport number"
              />
              {errors.id_number && (
                <p className="text-sm text-destructive mt-1">{errors.id_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Mobile Phone Number</Label>
              <Input
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="Enter your mobile number"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="employment_status">Employment Status</Label>
              <Select onValueChange={(value) => setValue('employment_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self-employed">Self-Employed</SelectItem>
                  <SelectItem value="contract">Contract Worker</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(employmentStatus === 'employed' || employmentStatus === 'contract') && (
              <>
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    {...register('job_title')}
                    placeholder="Enter your job title"
                  />
                </div>

                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    {...register('company_name')}
                    placeholder="Enter your company name"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="net_monthly_income">Net Monthly Income (ZAR)</Label>
              <Input
                type="number"
                {...register('net_monthly_income', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Income must be positive' }
                })}
                placeholder="Enter your monthly income"
              />
              {errors.net_monthly_income && (
                <p className="text-sm text-destructive mt-1">{errors.net_monthly_income.message}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="current_address">Current Address</Label>
              <Textarea
                {...register('current_address')}
                placeholder="Enter your current address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="reason_for_moving">Reason for Moving</Label>
              <Textarea
                {...register('reason_for_moving')}
                placeholder="Please explain why you are looking to move"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="previous_landlord_name">Previous Landlord Name (Optional)</Label>
              <Input
                {...register('previous_landlord_name')}
                placeholder="Enter previous landlord's name"
              />
            </div>

            <div>
              <Label htmlFor="previous_landlord_contact">Previous Landlord Contact (Optional)</Label>
              <Input
                {...register('previous_landlord_contact')}
                placeholder="Phone number or email"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Review Your Information</h3>
              <p className="text-sm text-muted-foreground">
                Please review the information you've provided. This will be saved as your tenant profile 
                and used for future applications.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setValue('consent_given', checked as boolean)}
              />
              <Label htmlFor="consent" className="text-sm">
                I confirm this information is accurate and consent to future credit and reference checks
              </Label>
            </div>
            {errors.consent_given && (
              <p className="text-sm text-destructive">{errors.consent_given.message}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tenant Application - Step {currentStep} of 4</CardTitle>
        <CardDescription>
          {currentStep === 1 && "Personal & Contact Information"}
          {currentStep === 2 && "Employment & Affordability"}
          {currentStep === 3 && "Rental History"}
          {currentStep === 4 && "Consent & Save"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStep()}

          <div className="flex justify-between mt-6">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !consentGiven}
                >
                  {loading ? 'Submitting...' : 'Save My Details'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}