import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
const FROM_NAME = Deno.env.get("FROM_NAME") || "FOLAT Multipurpose Investment";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  redirectTo?: string;
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string
): Promise<{ messageId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to send email";
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || error.name || errorText;
        if (error.errors?.[0]?.message) {
          errorMessage = error.errors[0].message;
        }
      } catch {
        errorMessage = errorText;
      }
      return { error: errorMessage };
    }

    const data = await response.json();
    return { messageId: data.id };
  } catch (error) {
    console.error("Resend API error:", error);
    return { error: error instanceof Error ? error.message : "Email send failed" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const requestData = (await req.json()) as ResetPasswordRequest;
    const { email, redirectTo } = requestData;

    if (!email) {
      return jsonResponse(400, { error: "Email is required" });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name")
      .eq("email", email)
      .maybeSingle();

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: redirectTo || `${new URL(req.url).origin}/reset-password`,
      },
    });

    if (linkError) {
      console.error("Generate link error:", linkError);
      return jsonResponse(400, { error: "User not found or unable to generate reset link" });
    }

    const fullName = profile?.full_name || email.split("@")[0];
    const resetUrl = linkData?.properties?.action_link || redirectTo || "";

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Reset Your Password</h2>
          <p>Hi ${fullName},</p>
          <p>We received a request to reset your password for your FOLAT account.</p>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <p>
            <a href="${resetUrl}" style="background-color: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </body>
      </html>
    `;

    const result = await sendEmailViaResend(email, "Reset Your FOLAT Password", html);

    if (result.error) {
      console.error("Email send error:", result.error);
      return jsonResponse(500, { error: "Failed to send reset email" });
    }

    return jsonResponse(200, { success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Function error:", error);
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});