import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { ScreeningProfile } from '../MultiStepScreeningForm';

interface HouseholdStepProps {
  formData: ScreeningProfile;
  updateFormData: (updates: Partial<ScreeningProfile>) => void;
  onNext: () => void;
  onSave: () => void;
}

export default function HouseholdStep({ formData, updateFormData }: HouseholdStepProps) {
  const [newOccupant, setNewOccupant] = useState({ name: '', relationship: '' });

  const addOccupant = () => {
    if (newOccupant.name && newOccupant.relationship) {
      updateFormData({
        occupants: [...formData.occupants, newOccupant]
      });
      setNewOccupant({ name: '', relationship: '' });
    }
  };

  const removeOccupant = (index: number) => {
    const updated = formData.occupants.filter((_, i) => i !== index);
    updateFormData({ occupants: updated });
  };

  const relationshipOptions = [
    'Spouse/Partner',
    'Child',
    'Parent',
    'Sibling',
    'Roommate',
    'Friend',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Other Occupants */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Other Occupants</h3>
          <p className="text-sm text-muted-foreground">
            List anyone else who will be living in the property
          </p>
        </div>
        <div className="space-y-4">
          {/* Existing occupants */}
          {formData.occupants.map((occupant, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <p className="font-medium">{occupant.name}</p>
                <p className="text-sm text-muted-foreground">{occupant.relationship}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeOccupant(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {/* Add new occupant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-2 border-dashed border-muted rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="occupantName">Name</Label>
              <Input
                id="occupantName"
                value={newOccupant.name}
                onChange={(e) => setNewOccupant({ ...newOccupant, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select 
                value={newOccupant.relationship} 
                onValueChange={(value) => setNewOccupant({ ...newOccupant, relationship: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={addOccupant}
                disabled={!newOccupant.name || !newOccupant.relationship}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Occupant
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pets */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Pets</h3>
        </div>
        <div className="space-y-4 p-4 border rounded-lg bg-card">
          <div className="space-y-2">
            <Label>Do you have pets?</Label>
            <RadioGroup
              value={formData.has_pets ? 'yes' : 'no'}
              onValueChange={(value) => updateFormData({ 
                has_pets: value === 'yes',
                pet_details: value === 'no' ? '' : formData.pet_details 
              })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="pets-yes" />
                <Label htmlFor="pets-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="pets-no" />
                <Label htmlFor="pets-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.has_pets && (
            <div className="space-y-2">
              <Label htmlFor="petDetails">Pet Details</Label>
              <Textarea
                id="petDetails"
                value={formData.pet_details || ''}
                onChange={(e) => updateFormData({ pet_details: e.target.value })}
                placeholder="Please describe your pets (type, breed, size, age, etc.)"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
