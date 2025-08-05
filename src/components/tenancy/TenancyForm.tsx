import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Property {
  id: string;
  title: string;
  location: string;
}

interface Profile {
  user_id: string;
  display_name: string;
  phone?: string;
  id_verified: boolean;
}

interface Tenancy {
  id?: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  lease_document_url?: string;
  notes?: string;
}

interface TenancyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenancy?: Tenancy | null;
}

export function TenancyForm({ isOpen, onClose, onSuccess, tenancy }: TenancyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Profile[]>([]);
  
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    security_deposit: '',
    status: 'active',
    lease_document_url: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      fetchTenants();
      
      if (tenancy) {
        setFormData({
          property_id: tenancy.property_id,
          tenant_id: tenancy.tenant_id,
          start_date: tenancy.start_date,
          end_date: tenancy.end_date,
          monthly_rent: tenancy.monthly_rent.toString(),
          security_deposit: tenancy.security_deposit.toString(),
          status: tenancy.status,
          lease_document_url: tenancy.lease_document_url || '',
          notes: tenancy.notes || ''
        });
      } else {
        setFormData({
          property_id: '',
          tenant_id: '',
          start_date: '',
          end_date: '',
          monthly_rent: '',
          security_deposit: '',
          status: 'active',
          lease_document_url: '',
          notes: ''
        });
      }
    }
  }, [isOpen, tenancy]);

  const fetchProperties = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location')
        .eq('landlord_id', user.id)
        .eq('status', 'available');

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch properties"
      });
    }
  };

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, phone, id_verified')
        .eq('id_verified', true);

      if (error) throw error;
      setTenants(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch verified tenants"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const tenancyData = {
        property_id: formData.property_id,
        tenant_id: formData.tenant_id,
        landlord_id: user.id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        monthly_rent: parseFloat(formData.monthly_rent),
        security_deposit: parseFloat(formData.security_deposit || '0'),
        status: formData.status,
        lease_document_url: formData.lease_document_url || null,
        notes: formData.notes || null
      };

      let error;
      if (tenancy?.id) {
        // Update existing tenancy
        const result = await supabase
          .from('tenancies')
          .update(tenancyData)
          .eq('id', tenancy.id);
        error = result.error;
      } else {
        // Create new tenancy
        const result = await supabase
          .from('tenancies')
          .insert([tenancyData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Tenancy ${tenancy?.id ? 'updated' : 'created'} successfully`
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tenancy?.id ? 'Edit Tenancy' : 'Create New Tenancy'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="property">Property</Label>
            <Select 
              value={formData.property_id} 
              onValueChange={(value) => handleInputChange('property_id', value)}
              disabled={!!tenancy?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title} - {property.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tenant">Tenant</Label>
            <Select 
              value={formData.tenant_id} 
              onValueChange={(value) => handleInputChange('tenant_id', value)}
              disabled={!!tenancy?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a verified tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.user_id} value={tenant.user_id}>
                    {tenant.display_name} {tenant.phone && `(${tenant.phone})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthly_rent">Monthly Rent (R)</Label>
              <Input
                id="monthly_rent"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_rent}
                onChange={(e) => handleInputChange('monthly_rent', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="security_deposit">Security Deposit (R)</Label>
              <Input
                id="security_deposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.security_deposit}
                onChange={(e) => handleInputChange('security_deposit', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lease_document_url">Lease Document URL</Label>
            <Input
              id="lease_document_url"
              type="url"
              value={formData.lease_document_url}
              onChange={(e) => handleInputChange('lease_document_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this tenancy..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (tenancy?.id ? 'Update Tenancy' : 'Create Tenancy')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}