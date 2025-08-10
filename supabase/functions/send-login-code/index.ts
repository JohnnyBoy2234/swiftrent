import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateCode(): string {
  // 6-digit numeric code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Rate limit: 30 seconds between sends
    const { data: latest } = await supabase
      .from("verification_codes")
      .select("id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      const last = new Date(latest.created_at).getTime();
      if (Date.now() - last < 30_000) {
        return new Response(JSON.stringify({ error: "Please wait before requesting another code.", retryIn: 30_000 - (Date.now() - last) }), { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
    }

    const code = generateCode();
    const code_hash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("verification_codes").insert({
      user_id: user.id,
      code_hash,
      expires_at: expiresAt,
      attempts: 0,
    });
    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create verification code" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const resend = new Resend(resendApiKey);
    const to = user.email ?? "";
    const from = "EasyRent <onboarding@resend.dev>"; // Use your verified domain if available

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your sign-in</h2>
        <p>Your EasyRent verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code expires in 10 minutes. If you didn\'t request this, you can safely ignore this email.</p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from,
      to: [to],
      subject: "Your EasyRent verification code",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Email error:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ sent: true, expiresAt }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    console.error("send-login-code error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});