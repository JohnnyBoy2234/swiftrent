import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface Payload {
  property_id: string;
  landlord_id: string;
  tenant_id: string;
  slot_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { property_id, landlord_id, tenant_id, slot_id } = (await req.json()) as Payload;

    // Fetch property
    const { data: property, error: propErr } = await admin
      .from("properties")
      .select("title, location")
      .eq("id", property_id)
      .maybeSingle();
    if (propErr) throw propErr;

    // Fetch slot
    const { data: slot, error: slotErr } = await admin
      .from("viewing_slots")
      .select("start_time, end_time")
      .eq("id", slot_id)
      .maybeSingle();
    if (slotErr) throw slotErr;

    // Fetch user emails via Admin API
    const [{ data: landlord }, { data: tenant }] = await Promise.all([
      admin.auth.admin.getUserById(landlord_id),
      admin.auth.admin.getUserById(tenant_id),
    ]);

    const landlordEmail = landlord.user?.email;
    const tenantEmail = tenant.user?.email;

    const when = slot?.start_time
      ? new Date(slot.start_time).toLocaleString()
      : "(time TBD)";

    const subject = `Viewing Confirmed: ${property?.title ?? "Property"} on ${when}`;

    const html = (recipient: "landlord" | "tenant") => `
      <div>
        <h2 style="margin:0 0 8px;">Viewing Confirmed</h2>
        <p style="margin:0 0 4px;">Property: <strong>${property?.title ?? property_id}</strong></p>
        <p style="margin:0 0 4px;">Address: ${property?.location ?? "N/A"}</p>
        <p style="margin:0 0 4px;">When: ${when}</p>
        <p style="margin:16px 0 0; color:#555;">This is an automated confirmation from SwiftRent.</p>
      </div>
    `;

    // Send emails
    const sends: Promise<any>[] = [];
    if (landlordEmail) {
      sends.push(
        resend.emails.send({ from: "SwiftRent <onboarding@resend.dev>", to: [landlordEmail], subject, html: html("landlord") })
      );
    }
    if (tenantEmail) {
      sends.push(
        resend.emails.send({ from: "SwiftRent <onboarding@resend.dev>", to: [tenantEmail], subject, html: html("tenant") })
      );
    }
    await Promise.allSettled(sends);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("notify-viewing-booked error", error);
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
