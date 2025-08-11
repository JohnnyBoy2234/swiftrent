import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BookViewingDialogProps {
  propertyId: string;
  landlordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SlotItem {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
}

export function BookViewingDialog({ propertyId, landlordId, open, onOpenChange }: BookViewingDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, propertyId]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("viewing_slots")
        .select("id,start_time,end_time,status")
        .eq("property_id", propertyId)
        .eq("status", "available")
        .order("start_time", { ascending: true });
      if (error) throw error;
      setSlots((data as any as SlotItem[]) || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load viewing slots", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slotId: string) => {
    if (!user) return;
    setBooking(slotId);
    try {
      const { error } = await (supabase as any)
        .from("viewing_slots")
        .update({ status: "booked", booked_by_tenant_id: user.id })
        .eq("id", slotId)
        .eq("status", "available");
      if (error) throw error;

      // Send notifications via edge function (emails)
      await supabase.functions.invoke("notify-viewing-booked", {
        body: {
          property_id: propertyId,
          landlord_id: landlordId,
          tenant_id: user.id,
          slot_id: slotId,
        },
      });

      toast({ title: "Viewing booked", description: "Your appointment has been confirmed" });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Booking failed", description: "That slot may no longer be available", variant: "destructive" });
    } finally {
      setBooking(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a Viewing</DialogTitle>
          <DialogDescription>Select an available time for your viewing</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading available times…</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No available times at the moment. Please check back later.</p>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {slots.map((s) => (
              <button
                key={s.id}
                onClick={() => setConfirmId(s.id)}
                className="w-full text-left rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <div className="font-medium">
                  {format(new Date(s.start_time), "EEEE, d MMMM")} at {format(new Date(s.start_time), "p")} 
                </div>
                <div className="text-sm text-muted-foreground">
                  Ends at {format(new Date(s.end_time), "p")}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Confirm action */}
        {confirmId && (
          <div className="rounded-md border p-3 space-y-3">
            <div className="text-sm">Confirm this viewing time?</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
              <Button onClick={() => bookSlot(confirmId)} disabled={!!booking}>
                {booking === confirmId ? "Booking…" : "Confirm"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
