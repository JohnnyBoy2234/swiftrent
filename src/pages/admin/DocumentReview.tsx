import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useDocuments } from '@/hooks/useDocuments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, CheckCircle, XCircle, Clock, FileText, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentReview() {
  const { documents, loading, updateDocumentStatus } = useDocuments();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success-green" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-earth-warm" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-green-light text-success-green border-success-green/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending':
        return 'bg-earth-light text-earth-warm border-earth-warm/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleApprove = async (documentId: string) => {
    await updateDocumentStatus(documentId, 'approved');
  };

  const handleReject = async (documentId: string) => {
    if (!rejectionReason.trim()) {
      return;
    }
    setIsRejecting(true);
    await updateDocumentStatus(documentId, 'rejected', rejectionReason);
    setRejectionReason('');
    setIsRejecting(false);
    setSelectedDocument(null);
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Review</h1>
            <p className="text-muted-foreground">
              Review and approve user uploaded documents
            </p>
          </div>

          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Review</h1>
          <p className="text-muted-foreground">
            Review and approve user uploaded documents
          </p>
        </div>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No documents to review</h3>
              <p className="text-muted-foreground">
                All documents have been processed or no documents have been uploaded yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getDocumentIcon(document.file_type)}
                        <div>
                          <h3 className="font-semibold">
                            {document.document_type} - {document.profiles?.display_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(document.status)}>
                        {getStatusIcon(document.status)}
                        <span className="ml-1">{document.status}</span>
                      </Badge>
                      
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Document Preview</DialogTitle>
                              <DialogDescription>
                                {document.document_type} from {document.profiles?.display_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="border rounded-lg p-4 bg-muted/50">
                                <p className="text-sm text-muted-foreground mb-2">File Path:</p>
                                <p className="font-mono text-sm">{document.file_path}</p>
                              </div>
                              {document.file_type.startsWith('image/') ? (
                                <div className="border rounded-lg p-4 text-center">
                                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Image preview would be displayed here
                                  </p>
                                </div>
                              ) : (
                                <div className="border rounded-lg p-4 text-center">
                                  <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Document preview would be displayed here
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {document.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(document.id)}
                              className="bg-success-green hover:bg-success-green/90"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setSelectedDocument(document)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Document</DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for rejecting this document.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                    <Textarea
                                      id="rejection-reason"
                                      placeholder="Please provide a clear reason for rejection..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedDocument(null);
                                      setRejectionReason('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => selectedDocument && handleReject(selectedDocument.id)}
                                    disabled={!rejectionReason.trim() || isRejecting}
                                  >
                                    {isRejecting ? 'Rejecting...' : 'Reject Document'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {document.status === 'rejected' && document.rejection_reason && (
                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <h4 className="font-semibold text-destructive mb-1">Rejection Reason:</h4>
                      <p className="text-sm">{document.rejection_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}