import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const nowIso = new Date().toISOString();
    const { data: latest, error: selectError } = await supabase
      .from("verification_codes")
      .select("id, code_hash, expires_at, attempts")
      .eq("user_id", user.id)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error("Select error:", selectError);
      return new Response(JSON.stringify({ error: "Failed to verify code" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (!latest) {
      return new Response(JSON.stringify({ error: "Code expired or not found" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (latest.attempts >= 3) {
      return new Response(JSON.stringify({ error: "Too many attempts. Please restart sign-in." }), { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const ok = await bcrypt.compare(code, latest.code_hash);
    if (!ok) {
      const { data: updated, error: updateError } = await supabase
        .from("verification_codes")
        .update({ attempts: (latest.attempts ?? 0) + 1 })
        .eq("id", latest.id)
        .select("attempts")
        .single();

      if (updateError) {
        console.error("Attempts update error:", updateError);
      }

      return new Response(JSON.stringify({ error: "Invalid code", attemptsLeft: Math.max(0, 3 - ((updated?.attempts ?? latest.attempts + 1))) }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Success: clean up codes for this user
    await supabase.from("verification_codes").delete().eq("user_id", user.id);

    return new Response(JSON.stringify({ verified: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    console.error("verify-login-code error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});