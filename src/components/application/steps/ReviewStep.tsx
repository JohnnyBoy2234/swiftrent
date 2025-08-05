import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, User, Users, DollarSign, Home, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ScreeningProfile } from '../MultiStepScreeningForm';

interface ReviewStepProps {
  formData: ScreeningProfile;
  updateFormData: (updates: Partial<ScreeningProfile>) => void;
  onNext: () => void;
  onSave: () => void;
}

export default function ReviewStep({ formData }: ReviewStepProps) {
  const getSectionStatus = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return formData.first_name && formData.last_name ? 'complete' : 'incomplete';
      case 'household':
        return 'complete'; // Optional section
      case 'income':
        return formData.income_sources.length > 0 ? 'complete' : 'incomplete';
      case 'residence':
        return formData.residences.length > 0 ? 'complete' : 'incomplete';
      case 'screening':
        return formData.screening_consent ? 'complete' : 'incomplete';
      default:
        return 'incomplete';
    }
  };

  const allSectionsComplete = ['personal', 'income', 'residence', 'screening']
    .every(section => getSectionStatus(section) === 'complete');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Review Your Application</h3>
        <p className="text-muted-foreground">
          Please review all sections below. You can go back to edit any information before submitting.
        </p>
        {allSectionsComplete ? (
          <Badge variant="default" className="mt-4">
            <CheckCircle className="w-4 h-4 mr-2" />
            Application Ready to Submit
          </Badge>
        ) : (
          <Badge variant="destructive" className="mt-4">
            <XCircle className="w-4 h-4 mr-2" />
            Please Complete All Required Sections
          </Badge>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["personal", "household", "income", "residence", "screening"]}>
        {/* Personal Information */}
        <AccordionItem value="personal">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
              <Badge variant={getSectionStatus('personal') === 'complete' ? 'default' : 'destructive'}>
                {getSectionStatus('personal') === 'complete' ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">First Name:</span>
                    <p className="text-sm text-muted-foreground">{formData.first_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Last Name:</span>
                    <p className="text-sm text-muted-foreground">{formData.last_name || 'Not provided'}</p>
                  </div>
                  {formData.middle_name && (
                    <div>
                      <span className="text-sm font-medium">Middle Name:</span>
                      <p className="text-sm text-muted-foreground">{formData.middle_name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Household Information */}
        <AccordionItem value="household">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Household Information</span>
              <Badge variant="default">Complete</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <span className="text-sm font-medium">Other Occupants:</span>
                  {formData.occupants.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {formData.occupants.map((occupant, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{occupant.name}</span>
                          <span className="text-muted-foreground">{occupant.relationship}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No additional occupants</p>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium">Pets:</span>
                  <p className="text-sm text-muted-foreground">
                    {formData.has_pets ? 'Yes' : 'No'}
                    {formData.has_pets && formData.pet_details && ` - ${formData.pet_details}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Income Information */}
        <AccordionItem value="income">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5" />
              <span>Income Information</span>
              <Badge variant={getSectionStatus('income') === 'complete' ? 'default' : 'destructive'}>
                {getSectionStatus('income') === 'complete' ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="p-4">
                {formData.income_sources.length > 0 ? (
                  <div className="space-y-4">
                    {formData.income_sources.map((source, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium">Type:</span>
                            <p className="text-sm text-muted-foreground">{source.type}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Monthly Income:</span>
                            <p className="text-sm text-muted-foreground">R{source.monthly_income.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Job Title:</span>
                            <p className="text-sm text-muted-foreground">{source.job_title}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Employer:</span>
                            <p className="text-sm text-muted-foreground">{source.employer}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Started:</span>
                            <p className="text-sm text-muted-foreground">
                              {source.started_on ? format(new Date(source.started_on), 'MMM yyyy') : 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Documents:</span>
                            <p className="text-sm text-muted-foreground">
                              {source.documents?.length || 0} uploaded
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-right">
                      <span className="text-lg font-semibold">
                        Total Monthly Income: R{formData.income_sources.reduce((sum, source) => sum + source.monthly_income, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No income sources provided</p>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Residence Information */}
        <AccordionItem value="residence">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5" />
              <span>Residence History</span>
              <Badge variant={getSectionStatus('residence') === 'complete' ? 'default' : 'destructive'}>
                {getSectionStatus('residence') === 'complete' ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="p-4">
                {formData.residences.length > 0 ? (
                  <div className="space-y-4">
                    {formData.residences.map((residence, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-2">
                          {index === 0 ? 'Current Residence' : `Previous Residence ${index}`}
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Type:</span>
                            <p className="text-muted-foreground">{residence.type}</p>
                          </div>
                          <div>
                            <span className="font-medium">Monthly Rent:</span>
                            <p className="text-muted-foreground">R{residence.monthly_rent.toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Address:</span>
                            <p className="text-muted-foreground">
                              {residence.street}, {residence.city}, {residence.province} {residence.postcode}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Moved In:</span>
                            <p className="text-muted-foreground">
                              {residence.moved_in ? format(new Date(residence.moved_in), 'MMM yyyy') : 'Not provided'}
                            </p>
                          </div>
                          {residence.reason_for_moving && (
                            <div>
                              <span className="font-medium">Reason for Moving:</span>
                              <p className="text-muted-foreground">{residence.reason_for_moving}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No residence history provided</p>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Screening Consent */}
        <AccordionItem value="screening">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span>Screening Consent</span>
              <Badge variant={getSectionStatus('screening') === 'complete' ? 'default' : 'destructive'}>
                {getSectionStatus('screening') === 'complete' ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {formData.screening_consent ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">
                    Background and credit check consent: {formData.screening_consent ? 'Granted' : 'Not granted'}
                  </span>
                </div>
                {formData.screening_consent && formData.screening_consent_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Consent granted on {format(new Date(formData.screening_consent_date), 'PPP')}
                  </p>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}