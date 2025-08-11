import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [booking, setBooking] = useState(false);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSlots();
      setSelectedSlotId(null); // Reset selection when dialog opens
    }
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

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(selectedSlotId === slotId ? null : slotId);
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedSlotId) return;
    
    setBooking(true);
    try {
      const { error } = await (supabase as any)
        .from("viewing_slots")
        .update({ status: "booked", booked_by_tenant_id: user.id })
        .eq("id", selectedSlotId)
        .eq("status", "available");
      if (error) throw error;

      // Send notifications via edge function (emails)
      await supabase.functions.invoke("notify-viewing-booked", {
        body: {
          property_id: propertyId,
          landlord_id: landlordId,
          tenant_id: user.id,
          slot_id: selectedSlotId,
        },
      });

      toast({ 
        title: "Viewing booked successfully!", 
        description: "Your appointment has been confirmed. You'll receive an email confirmation." 
      });
      setSelectedSlotId(null);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast({ 
        title: "Booking failed", 
        description: "That time slot may no longer be available. Please try a different time.", 
        variant: "destructive" 
      });
      // Refresh slots to show current availability
      await fetchSlots();
    } finally {
      setBooking(false);
    }
  };

  const selectedSlot = slots.find(slot => slot.id === selectedSlotId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book a Viewing
          </DialogTitle>
          <DialogDescription>
            Select your preferred viewing time from the available slots below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-sm text-muted-foreground">Loading available times...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No viewing times are currently available. Please check back later or contact the landlord directly.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot.id)}
                    className={cn(
                      "w-full text-left rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md",
                      selectedSlotId === slot.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    )}
                    disabled={booking}
                    role="radio"
                    aria-checked={selectedSlotId === slot.id}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSlotSelect(slot.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {format(new Date(slot.start_time), "EEEE, MMMM d")}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {format(new Date(slot.start_time), "h:mm a")} - {format(new Date(slot.end_time), "h:mm a")}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          selectedSlotId === slot.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}>
                          {selectedSlotId === slot.id && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selection Summary & Confirm Button */}
              <div className="border-t pt-4 space-y-4">
                {selectedSlotId && selectedSlot ? (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">Selected viewing time:</div>
                    <div className="font-medium">
                      {format(new Date(selectedSlot.start_time), "EEEE, MMMM d")} at {format(new Date(selectedSlot.start_time), "h:mm a")}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    Please select a viewing time above
                  </div>
                )}
                
                <Button 
                  onClick={handleConfirmBooking}
                  disabled={!selectedSlotId || booking}
                  className="w-full"
                  size="lg"
                >
                  {booking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking Your Viewing...
                    </>
                  ) : selectedSlotId ? (
                    "Confirm Booking"
                  ) : (
                    "Select a Time Slot"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
