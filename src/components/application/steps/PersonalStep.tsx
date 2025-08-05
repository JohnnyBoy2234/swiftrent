import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScreeningProfile } from '../MultiStepScreeningForm';

interface PersonalStepProps {
  formData: ScreeningProfile;
  updateFormData: (updates: Partial<ScreeningProfile>) => void;
  onNext: () => void;
  onSave: () => void;
}

export default function PersonalStep({ formData, updateFormData }: PersonalStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.first_name}
            onChange={(e) => updateFormData({ first_name: e.target.value })}
            placeholder="Enter your first name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            value={formData.middle_name || ''}
            onChange={(e) => updateFormData({ middle_name: e.target.value })}
            placeholder="Enter your middle name (optional)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.last_name}
            onChange={(e) => updateFormData({ last_name: e.target.value })}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        * Required fields must be completed to continue to the next step.
      </p>
    </div>
  );
}