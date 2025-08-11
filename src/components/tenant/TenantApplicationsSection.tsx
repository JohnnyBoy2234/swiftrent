import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApplicationInvites } from "@/hooks/useApplicationInvites";
import { useNavigate } from "react-router-dom";

export const TenantApplicationsSection = () => {
  const { invites, loading } = useApplicationInvites();
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Applications</h2>
        {invites.length > 0 && (
          <Badge variant="outline">{invites.length} invitations</Badge>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">Loading invitations…</CardContent>
        </Card>
      ) : invites.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Invitations Yet</CardTitle>
            <CardDescription>When a landlord invites you to apply, it will appear here.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invites.map((inv) => {
            const photo = inv.property?.images?.[0] || "/placeholder.svg";
            return (
              <Card key={inv.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="md:col-span-1 h-40 md:h-full">
                    <img
                      src={photo}
                      alt={`Primary photo of ${inv.property?.title || 'property'}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{inv.property?.title || 'Property'}</CardTitle>
                          <CardDescription>{inv.property?.location}</CardDescription>
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">Landlord:</span>{' '}
                            <span className="text-sm font-medium">{inv.landlord?.display_name || 'Landlord'}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">Invitation Received</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Valid until {new Date(inv.expires_at).toLocaleDateString()}</p>
                        <Button onClick={() => navigate(`/apply/invite/${inv.token}`)}>Start Application</Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
