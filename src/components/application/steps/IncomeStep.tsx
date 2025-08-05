import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2, Plus, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ScreeningProfile } from '../MultiStepScreeningForm';

interface IncomeStepProps {
  formData: ScreeningProfile;
  updateFormData: (updates: Partial<ScreeningProfile>) => void;
  onNext: () => void;
  onSave: () => void;
}

export default function IncomeStep({ formData, updateFormData }: IncomeStepProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

  const incomeTypes = [
    'Employment',
    'Self-Employment',
    'Investment Income',
    'Pension',
    'Social Benefits',
    'Other'
  ];

  const addIncomeSource = () => {
    const newSource = {
      type: '',
      monthly_income: 0,
      job_title: '',
      employer: '',
      started_on: '',
      employer_contact_name: '',
      employer_contact_email: '',
      employer_contact_phone: '',
      documents: []
    };

    updateFormData({
      income_sources: [...formData.income_sources, newSource]
    });
  };

  const updateIncomeSource = (index: number, updates: any) => {
    const updated = formData.income_sources.map((source, i) =>
      i === index ? { ...source, ...updates } : source
    );
    updateFormData({ income_sources: updated });
  };

  const removeIncomeSource = (index: number) => {
    const updated = formData.income_sources.filter((_, i) => i !== index);
    updateFormData({ income_sources: updated });
  };

  const uploadDocument = async (index: number, file: File) => {
    if (!user) return;

    setUploading(prev => ({ ...prev, [index]: true }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('income-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update the income source with the new document
      const currentSource = formData.income_sources[index];
      const updatedDocuments = [...(currentSource.documents || []), fileName];
      
      updateIncomeSource(index, { documents: updatedDocuments });

      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Income Sources</h3>
          <p className="text-sm text-muted-foreground">
            Add all sources of income to demonstrate your ability to pay rent
          </p>
        </div>
        <Button onClick={addIncomeSource} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Income Source
        </Button>
      </div>

      {formData.income_sources.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No income sources added yet</p>
            <Button onClick={addIncomeSource} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Income Source
            </Button>
          </CardContent>
        </Card>
      )}

      {formData.income_sources.map((source, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Income Source {index + 1}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeIncomeSource(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Income Type *</Label>
                <Select 
                  value={source.type} 
                  onValueChange={(value) => updateIncomeSource(index, { type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Monthly Income (ZAR) *</Label>
                <Input
                  type="number"
                  value={source.monthly_income}
                  onChange={(e) => updateIncomeSource(index, { monthly_income: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  value={source.job_title}
                  onChange={(e) => updateIncomeSource(index, { job_title: e.target.value })}
                  placeholder="Enter your job title"
                />
              </div>

              <div className="space-y-2">
                <Label>Employer/Company *</Label>
                <Input
                  value={source.employer}
                  onChange={(e) => updateIncomeSource(index, { employer: e.target.value })}
                  placeholder="Enter employer name"
                />
              </div>

              <div className="space-y-2">
                <Label>Started On *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !source.started_on && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {source.started_on ? format(new Date(source.started_on), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={source.started_on ? new Date(source.started_on) : undefined}
                      onSelect={(date) => updateIncomeSource(index, { started_on: date?.toISOString() })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Income Documents */}
            <div className="space-y-2">
              <Label>Income Documents</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4">
                <input
                  type="file"
                  id={`file-${index}`}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => uploadDocument(index, file));
                  }}
                  className="hidden"
                />
                <label 
                  htmlFor={`file-${index}`}
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {uploading[index] ? 'Uploading...' : 'Click to upload payslips, bank statements, or other income documents'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG, DOC, DOCX (Max 5 files)
                  </p>
                </label>
              </div>
              
              {source.documents && source.documents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">{source.documents.length} document(s) uploaded</p>
                </div>
              )}
            </div>

            {/* Employer Contact (Optional) */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Employer Contact (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={source.employer_contact_name || ''}
                    onChange={(e) => updateIncomeSource(index, { employer_contact_name: e.target.value })}
                    placeholder="Contact person"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={source.employer_contact_email || ''}
                    onChange={(e) => updateIncomeSource(index, { employer_contact_email: e.target.value })}
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={source.employer_contact_phone || ''}
                    onChange={(e) => updateIncomeSource(index, { employer_contact_phone: e.target.value })}
                    placeholder="+27 123 456 789"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {formData.income_sources.length > 0 && (
        <p className="text-sm text-muted-foreground">
          * Required fields must be completed to continue to the next step.
        </p>
      )}
    </div>
  );
}