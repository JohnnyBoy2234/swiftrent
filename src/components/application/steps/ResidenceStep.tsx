import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScreeningProfile } from '../MultiStepScreeningForm';

interface ResidenceStepProps {
  formData: ScreeningProfile;
  updateFormData: (updates: Partial<ScreeningProfile>) => void;
  onNext: () => void;
  onSave: () => void;
}

export default function ResidenceStep({ formData, updateFormData }: ResidenceStepProps) {
  const residenceTypes = [
    'I rent this home',
    'I own this home',
    'I live with family/friends',
    'Student accommodation',
    'Corporate housing',
    'Other'
  ];

  const addResidence = () => {
    const newResidence = {
      type: '',
      street: '',
      city: '',
      province: '',
      postcode: '',
      moved_in: '',
      monthly_rent: 0,
      reason_for_moving: '',
      landlord_name: '',
      landlord_email: '',
      landlord_phone: ''
    };

    updateFormData({
      residences: [...formData.residences, newResidence]
    });
  };

  const updateResidence = (index: number, updates: any) => {
    const updated = formData.residences.map((residence, i) =>
      i === index ? { ...residence, ...updates } : residence
    );
    updateFormData({ residences: updated });
  };

  const removeResidence = (index: number) => {
    const updated = formData.residences.filter((_, i) => i !== index);
    updateFormData({ residences: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Residence History</h3>
          <p className="text-sm text-muted-foreground">
            Add your current and previous addresses (minimum of current address required)
          </p>
        </div>
        <Button onClick={addResidence} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Residence
        </Button>
      </div>

      {formData.residences.length === 0 && (
        <div className="p-8 text-center border rounded-lg bg-card">
          <p className="text-muted-foreground mb-4">No residences added yet</p>
          <Button onClick={addResidence} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Current Address
          </Button>
        </div>
      )}

      {formData.residences.map((residence, index) => (
        <div key={index} className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">
              {index === 0 ? 'Current Residence' : `Previous Residence ${index}`}
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeResidence(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Residence Type *</Label>
              <Select 
                value={residence.type} 
                onValueChange={(value) => updateResidence(index, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select residence type" />
                </SelectTrigger>
                <SelectContent>
                  {residenceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Input
                  value={residence.street}
                  onChange={(e) => updateResidence(index, { street: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={residence.city}
                  onChange={(e) => updateResidence(index, { city: e.target.value })}
                  placeholder="Cape Town"
                />
              </div>

              <div className="space-y-2">
                <Label>Province *</Label>
                <Select 
                  value={residence.province} 
                  onValueChange={(value) => updateResidence(index, { province: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Western Cape">Western Cape</SelectItem>
                    <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                    <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                    <SelectItem value="Free State">Free State</SelectItem>
                    <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                    <SelectItem value="North West">North West</SelectItem>
                    <SelectItem value="Gauteng">Gauteng</SelectItem>
                    <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                    <SelectItem value="Limpopo">Limpopo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Postcode *</Label>
                <Input
                  value={residence.postcode}
                  onChange={(e) => updateResidence(index, { postcode: e.target.value })}
                  placeholder="8001"
                />
              </div>

              <div className="space-y-2">
                <Label>Moved In *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !residence.moved_in && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {residence.moved_in ? format(new Date(residence.moved_in), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={residence.moved_in ? new Date(residence.moved_in) : undefined}
                      onSelect={(date) => updateResidence(index, { moved_in: date?.toISOString() })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Monthly Rent (ZAR) *</Label>
                <Input
                  type="number"
                  value={residence.monthly_rent}
                  onChange={(e) => updateResidence(index, { monthly_rent: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason for Moving</Label>
              <Textarea
                value={residence.reason_for_moving || ''}
                onChange={(e) => updateResidence(index, { reason_for_moving: e.target.value })}
                placeholder="Why are you moving from this residence?"
                rows={3}
              />
            </div>

            {/* Landlord Contact (Optional for rentals) */}
            {(residence.type.includes('rent') || residence.type.includes('Student')) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Landlord/Property Manager Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={residence.landlord_name || ''}
                      onChange={(e) => updateResidence(index, { landlord_name: e.target.value })}
                      placeholder="Landlord name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={residence.landlord_email || ''}
                      onChange={(e) => updateResidence(index, { landlord_email: e.target.value })}
                      placeholder="landlord@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={residence.landlord_phone || ''}
                      onChange={(e) => updateResidence(index, { landlord_phone: e.target.value })}
                      placeholder="+27 123 456 789"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {formData.residences.length > 0 && (
        <p className="text-sm text-muted-foreground">
          * Required fields must be completed to continue to the next step.
        </p>
      )}
    </div>
  );
}