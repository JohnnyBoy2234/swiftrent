import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Step components
import PersonalStep from './steps/PersonalStep';
import HouseholdStep from './steps/HouseholdStep';
import IncomeStep from './steps/IncomeStep';
import ResidenceStep from './steps/ResidenceStep';
import ScreeningReportsStep from './steps/ScreeningReportsStep';
import ReviewStep from './steps/ReviewStep';

export interface ScreeningProfile {
  id?: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  occupants: Array<{ name: string; relationship: string }>;
  has_pets: boolean;
  pet_details?: string;
  income_sources: Array<{
    type: string;
    monthly_income: number;
    job_title: string;
    employer: string;
    started_on: string;
    employer_contact_name?: string;
    employer_contact_email?: string;
    employer_contact_phone?: string;
    documents?: string[];
  }>;
  residences: Array<{
    type: string;
    street: string;
    city: string;
    province: string;
    postcode: string;
    moved_in: string;
    monthly_rent: number;
    reason_for_moving?: string;
    landlord_name?: string;
    landlord_email?: string;
    landlord_phone?: string;
  }>;
  screening_consent: boolean;
  screening_consent_date?: string;
  is_complete: boolean;
}

interface MultiStepScreeningFormProps {
  propertyId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'personal', title: 'Personal', component: PersonalStep },
  { id: 'household', title: 'Household', component: HouseholdStep },
  { id: 'income', title: 'Income', component: IncomeStep },
  { id: 'residence', title: 'Residence', component: ResidenceStep },
  { id: 'screening', title: 'Screening Reports', component: ScreeningReportsStep },
  { id: 'review', title: 'Review', component: ReviewStep },
];

export default function MultiStepScreeningForm({ propertyId, onComplete, onCancel }: MultiStepScreeningFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isExistingProfile, setIsExistingProfile] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const [formData, setFormData] = useState<ScreeningProfile>({
    user_id: user?.id || '',
    first_name: '',
    middle_name: '',
    last_name: '',
    occupants: [],
    has_pets: false,
    pet_details: '',
    income_sources: [],
    residences: [],
    screening_consent: false,
    is_complete: false,
  });

  useEffect(() => {
    checkExistingProfile();
  }, [user]);

  const checkExistingProfile = async () => {
    if (!user) return;

    console.log('Checking existing profile for user:', user.id, 'property:', propertyId);

    try {
      // First check if user has already applied for this property
      const { data: existingApplication, error: appError } = await supabase
        .from('applications')
        .select('id')
        .eq('tenant_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (appError) throw appError;

      console.log('Existing application check:', existingApplication);

      // If user already applied, show message and close
      if (existingApplication) {
        console.log('User already has application for this property');
        toast({
          title: "Already Applied",
          description: "You have already submitted an application for this property.",
        });
        onComplete();
        return;
      }

      // Check for existing profile
      const { data: existingProfile, error } = await supabase
        .from('screening_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      console.log('Existing profile check:', existingProfile);

      if (existingProfile) {
        // Type the JSON data properly
        const typedProfile: ScreeningProfile = {
          ...existingProfile,
          occupants: Array.isArray(existingProfile.occupants) ? existingProfile.occupants as Array<{ name: string; relationship: string }> : [],
          income_sources: Array.isArray(existingProfile.income_sources) ? existingProfile.income_sources as ScreeningProfile['income_sources'] : [],
          residences: Array.isArray(existingProfile.residences) ? existingProfile.residences as ScreeningProfile['residences'] : []
        };
        
        setFormData(typedProfile);
        setIsExistingProfile(true);
        // If profile is complete, go straight to review
        if (existingProfile.is_complete) {
          console.log('Profile is complete, going to review step');
          setCurrentStep(5); // Review step
        } else {
          console.log('Profile exists but incomplete, starting from beginning');
        }
      } else {
        console.log('No existing profile found, starting fresh');
      }
    } catch (error) {
      console.error('Error checking existing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoSaveProfile = useCallback(async () => {
    if (!user || !isExistingProfile) return;

    try {
      setAutoSaving(true);
      const profileData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('screening_profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) throw error;

      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [user, formData, isExistingProfile]);

  const updateFormData = useCallback((updates: Partial<ScreeningProfile>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (debounced)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveProfile();
    }, 1000);
  }, [autoSaveProfile]);

  const validateCurrentStep = () => {
    const currentStepId = STEPS[currentStep].id;
    
    switch (currentStepId) {
      case 'personal':
        return formData.first_name && formData.last_name;
      case 'household':
        return true; // Optional step
      case 'income':
        return formData.income_sources.length > 0;
      case 'residence':
        return formData.residences.length > 0;
      case 'screening':
        return formData.screening_consent;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (validateCurrentStep() && currentStep < STEPS.length - 1) {
      // Auto-save before moving to next step
      await autoSaveProfile();
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = async () => {
    if (currentStep > 0) {
      // Auto-save before moving to previous step
      await autoSaveProfile();
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      const profileData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (isExistingProfile) {
        const { error } = await supabase
          .from('screening_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('screening_profiles')
          .insert([profileData]);

        if (error) throw error;
        setIsExistingProfile(true);
      }

      toast({
        title: "Profile Saved",
        description: "Your screening profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const submitApplication = async () => {
    if (!user) return;

    try {
      // Get landlord_id from property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('landlord_id')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      // Mark profile as complete
      await supabase
        .from('screening_profiles')
        .update({ 
          is_complete: true,
          screening_consent_date: formData.screening_consent ? new Date().toISOString() : null
        })
        .eq('user_id', user.id);

      // Create application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert([{
          property_id: propertyId,
          tenant_id: user.id,
          landlord_id: property.landlord_id,
          status: 'pending'
        }]);

      if (applicationError) throw applicationError;

      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'complete';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const isStepComplete = (stepIndex: number) => {
    const stepId = STEPS[stepIndex].id;
    switch (stepId) {
      case 'personal':
        return formData.first_name && formData.last_name;
      case 'household':
        return true; // Optional step - always considered complete
      case 'income':
        return formData.income_sources.length > 0;
      case 'residence':
        return formData.residences.length > 0;
      case 'screening':
        return formData.screening_consent;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="flex flex-col h-screen">
      {/* Header with Progress Bar */}
      <header className="p-4 sm:p-6 border-b bg-background sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-4">Rental Application</h1>
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
          {STEPS.map((step, index) => (
            <span key={step.id} className={index === currentStep ? 'font-bold text-primary' : ''}>
              {step.title}
            </span>
          ))}
        </div>
      </header>

      {/* Scrollable Main Content Area */}
      <main className="flex-grow overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Auto-save indicator */}
          {showSavedMessage && (
            <div className="mb-4 bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm border border-green-200 shadow-sm">
              Progress saved ✓
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {STEPS[currentStep].title}
                {autoSaving && (
                  <span className="text-sm text-muted-foreground">Saving...</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onSave={saveProfile}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Sticky Footer for Navigation */}
      <footer className="p-4 border-t bg-background sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : prevStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length - 1 ? (
              <Button 
                onClick={submitApplication}
                disabled={!Object.keys(STEPS).every((_, index) => isStepComplete(index))}
                className="flex items-center gap-2"
              >
                Submit Application
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={!validateCurrentStep()}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}