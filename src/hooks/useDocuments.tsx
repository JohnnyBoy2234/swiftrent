import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Document {
  id: string;
  user_id: string;
  file_path: string;
  file_type: string;
  document_type: string;
  status: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  profiles?: {
    display_name: string;
  };
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      // For now, return empty array until documents table is created
      setDocuments([]);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        variant: "destructive",
        title: "Error loading documents",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (
    documentId: string, 
    status: 'approved' | 'rejected', 
    rejectionReason?: string
  ) => {
    try {
      // Placeholder until documents table is available
      toast({
        title: `Document ${status}`,
        description: `The document has been ${status} successfully.`
      });

      await fetchDocuments();
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast({
        variant: "destructive",
        title: "Error updating document",
        description: error.message
      });
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    fetchDocuments,
    updateDocumentStatus
  };
}