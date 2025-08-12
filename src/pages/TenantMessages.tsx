import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  MessageSquare,
  FileText,
  DollarSign,
} from 'lucide-react';
import Messages from '@/pages/Messages';

export default function TenantMessages() {
  const { user, isLandlord, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (isLandlord) {
      navigate('/dashboard');
      return;
    }
  }, [user, isLandlord, navigate]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (same as TenantDashboard) */}
      <div className="w-64 border-r bg-card">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">SwiftRent</h1>
          </div>
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => navigate('/tenant-dashboard')}>
              <Home className="w-5 h-5" />
              Dashboard
            </Button>
            <Button variant="default" className="w-full justify-start gap-3">
              <MessageSquare className="w-5 h-5" />
              Messages
              <Badge className="ml-auto h-5 min-w-5 p-0 text-xs" />
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <FileText className="w-5 h-5" />
              My Leases
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <DollarSign className="w-5 h-5" />
              Payments
            </Button>
            <Button variant="outline" className="w-full mt-6" onClick={signOut}>
              Sign Out
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content: embed existing Messages UI */}
      <div className="flex-1">
        <Messages />
      </div>
    </div>
  );
}
