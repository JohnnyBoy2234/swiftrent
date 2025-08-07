import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TenancyData {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  monthly_rent: number;
  security_deposit: number;
  start_date: string;
  end_date: string;
  properties: {
    title: string;
    location: string;
    description: string;
  };
  tenant_profile: {
    display_name: string;
  };
  landlord_profile: {
    display_name: string;
  };
}

const generateLeasePDF = (tenancy: TenancyData): Uint8Array => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("RESIDENTIAL LEASE AGREEMENT", 20, 30);
  
  // Property Information
  doc.setFontSize(14);
  doc.text("PROPERTY INFORMATION", 20, 50);
  doc.setFontSize(12);
  doc.text(`Property: ${tenancy.properties.title}`, 20, 65);
  doc.text(`Address: ${tenancy.properties.location}`, 20, 75);
  doc.text(`Description: ${tenancy.properties.description}`, 20, 85);
  
  // Parties
  doc.setFontSize(14);
  doc.text("PARTIES", 20, 105);
  doc.setFontSize(12);
  doc.text(`Landlord: ${tenancy.landlord_profile.display_name}`, 20, 120);
  doc.text(`Tenant: ${tenancy.tenant_profile.display_name}`, 20, 130);
  
  // Lease Terms
  doc.setFontSize(14);
  doc.text("LEASE TERMS", 20, 150);
  doc.setFontSize(12);
  doc.text(`Monthly Rent: $${tenancy.monthly_rent}`, 20, 165);
  doc.text(`Security Deposit: $${tenancy.security_deposit}`, 20, 175);
  doc.text(`Lease Start Date: ${new Date(tenancy.start_date).toLocaleDateString()}`, 20, 185);
  doc.text(`Lease End Date: ${new Date(tenancy.end_date).toLocaleDateString()}`, 20, 195);
  
  // Terms and Conditions
  doc.setFontSize(14);
  doc.text("TERMS AND CONDITIONS", 20, 215);
  doc.setFontSize(10);
  
  const terms = [
    "1. The tenant agrees to pay the monthly rent on or before the 1st day of each month.",
    "2. The security deposit will be returned within 30 days of lease termination, subject to property condition.",
    "3. The tenant is responsible for maintaining the property in good condition.",
    "4. No subletting is allowed without written consent from the landlord.",
    "5. The landlord has the right to inspect the property with 24-hour notice.",
    "6. Any damages beyond normal wear and tear will be deducted from the security deposit.",
    "7. This lease agreement is governed by local housing laws and regulations.",
  ];
  
  let yPosition = 230;
  terms.forEach((term) => {
    const lines = doc.splitTextToSize(term, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 5;
  });
  
  // Signature areas
  doc.setFontSize(12);
  doc.text("Landlord Signature: ___________________________ Date: ___________", 20, yPosition + 20);
  doc.text("Tenant Signature: _____________________________ Date: ___________", 20, yPosition + 40);
  
  return doc.output('arraybuffer');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { tenancyId } = await req.json();
    if (!tenancyId) throw new Error("Missing tenancyId");

    // Fetch all related data for the lease
    const { data: tenancy, error: tenancyError } = await supabaseClient
      .from("tenancies")
      .select(`
        *,
        properties (title, location, description),
        tenant_profile:profiles!tenant_id (display_name),
        landlord_profile:profiles!landlord_id (display_name)
      `)
      .eq("id", tenancyId)
      .single();

    if (tenancyError) throw tenancyError;
    if (!tenancy || !tenancy.landlord_profile || !tenancy.tenant_profile || !tenancy.properties) {
        throw new Error("Incomplete tenancy data found. Could not generate lease.");
    }
    
    // --- PDF Generation Logic ---
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;

    let y = height - 50;
    const drawText = (text: string, size = fontSize, isBold = false) => {
      page.drawText(text, {
        x: 50,
        y,
        font: isBold ? boldFont : font,
        size,
        color: rgb(0, 0, 0),
      });
      y -= size * 1.5;
    };

    drawText("Residential Lease Agreement", 18, true);
    y -= 20;

    drawText("This Lease Agreement is entered into on " + new Date().toLocaleDateString(), fontSize);
    y -= 10;
    
    drawText("PARTIES", fontSize, true);
    drawText(`Landlord: ${safeString(tenancy.landlord_profile.display_name)}`);
    drawText(`Tenant: ${safeString(tenancy.tenant_profile.display_name)}`);
    y -= 10;

    drawText("PROPERTY", fontSize, true);
    drawText(`Property: ${safeString(tenancy.properties.title)}`);
    drawText(`Address: ${safeString(tenancy.properties.location)}`);
    drawText(`Description: ${safeString(tenancy.properties.description)}`);
    y -= 10;

    drawText("TERMS", fontSize, true);
    drawText(`Lease Start Date: ${new Date(safeString(tenancy.start_date, new Date().toISOString())).toLocaleDateString()}`);
    drawText(`Lease End Date: ${new Date(safeString(tenancy.end_date, new Date().toISOString())).toLocaleDateString()}`);
    drawText(`Monthly Rent: $${safeString(tenancy.monthly_rent)}`);
    drawText(`Security Deposit: $${safeString(tenancy.security_deposit)}`);
    y -= 20;

    drawText("This document becomes legally binding upon the digital signature of both parties.", 10);
    
    const pdfBytes = await pdfDoc.save();
    const filePath = `${tenancy.landlord_id}/${tenancyId}/lease-${Date.now()}.pdf`;

    // Upload PDF to Supabase Storage
    const { error: uploadError } = await supabaseClient.storage
      .from("lease-documents")
      .upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Update the tenancy record with the PDF PATH
    const { error: updateError } = await supabaseClient
      .from("tenancies")
      .update({ lease_document_path: filePath })
      .eq("id", tenancyId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      success: true, 
      documentPath: filePath 
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
      status: 200,
    });

  } catch (error) {
    console.error("Lease Generation Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
      status: 500,
    });
  }
});