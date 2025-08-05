import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

interface IdVerificationFormData {
  idNumber: string;
  firstName: string;
  lastName: string;
}

export default function IdVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  
  const returnUrl = searchParams.get('return') || '/properties';
  
  const { register, handleSubmit, formState: { errors } } = useForm<IdVerificationFormData>();

  useEffect(() => {
    checkVerificationStatus();
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id_verification_status')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setIsVerified(data.id_verification_status === 'verified' || data.id_verification_status === 'pending');
    } catch (error: any) {
      console.error('Error checking verification status:', error);
    }
  };

  const onSubmit = async (data: IdVerificationFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to verify your identity."
      });
      return;
    }

    if (!idFile) {
      toast({
        variant: "destructive",
        title: "ID document required",
        description: "Please upload a photo of your ID document."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload ID document (for demonstration - in production you'd use proper document verification)
      const fileExt = idFile.name.split('.').pop();
      const fileName = `${user.id}-id-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(`id-documents/${fileName}`, idFile);

      if (uploadError) throw uploadError;

      // Update profile to mark as pending verification
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          id_verified: false,
          id_verification_status: 'pending'
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "ID Verification Submitted!",
        description: "Your documents have been submitted for review. You can now access the platform while we verify your identity."
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate(returnUrl);
      }, 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="p-8 text-center max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to verify your identity</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="p-8 text-center max-w-md">
          <CardHeader>
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <CardTitle>ID Verified!</CardTitle>
            <CardDescription>Your identity has been successfully verified</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="mb-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified User
            </Badge>
            <Button onClick={() => navigate(returnUrl)} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>
              Complete your identity verification to contact landlords and apply for properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number *</Label>
                <Input
                  {...register('idNumber', { 
                    required: 'ID number is required',
                    pattern: {
                      value: /^[0-9]{13}$/,
                      message: 'Please enter a valid 13-digit ID number'
                    }
                  })}
                  placeholder="9001015009087"
                  maxLength={13}
                />
                {errors.idNumber && (
                  <p className="text-sm text-destructive">{errors.idNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idDocument">Upload ID Document *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop your ID document
                  </p>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto"
                  />
                  {idFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {idFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Why do we need this?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Verify your identity for landlord safety</li>
                  <li>• Comply with rental regulations</li>
                  <li>• Prevent fraud and ensure secure transactions</li>
                  <li>• Enable trusted communication between tenants and landlords</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Complete Verification'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}