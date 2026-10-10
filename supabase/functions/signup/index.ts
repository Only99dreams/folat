import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function assertEnv(name: string, value: string | null): string {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
  resendApiKey: string,
  fromEmail: string,
  fromName: string
): Promise<{ success: boolean; error?: string }> {
  if (!resendApiKey) {
    return { error: "RESEND_API_KEY not configured" };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject,
        html,
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

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}

Deno.serve(async (req) => {
  const respondCors = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respondCors({ error: "Method not allowed" }, 405);
  }

  try {
    const resendApiKey = assertEnv("RESEND_API_KEY", Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = assertEnv("SUPABASE_URL", Deno.env.get("SUPABASE_URL"));
    const supabaseServiceRoleKey = assertEnv("SUPABASE_SERVICE_ROLE_KEY", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@folatinvestment.com";
    const fromName = Deno.env.get("FROM_NAME") || "FOLAT Multipurpose Investment";

    const { email, password, fullName, phone, role } = await req.json();

    if (!email || !password || !fullName) {
      return respondCors({ error: "email, password, and fullName are required" }, 400);
    }

    if ((password || "").length < 6) {
      return respondCors({ error: "Password must be at least 6 characters" }, 400);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedEmail = email.trim().toLowerCase();

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        phone: (phone || "").trim(),
      },
    });

    if (createError || !created.user) {
      const duplicate = /already been registered|already exists|duplicate/i.test(createError?.message || "");
      if (duplicate) {
        return respondCors({ error: "This email is already registered. Please log in instead." }, 409);
      }
      return respondCors({ error: createError?.message || "Failed to create user" }, 400);
    }

    const userId = created.user.id;

    const initials = fullName
      .trim()
      .split(" ")
      .map((part: string) => part.trim()[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const allowedRoles = ["super_admin","branch_manager","finance_officer","loan_officer","staff_member","front_desk","auditor","hr_manager","unassigned"];
    const normalizedRole = allowedRoles.includes(role) ? role : "front_desk";

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim(),
      email: normalizedEmail,
      phone: (phone || "").trim(),
      role: normalizedRole,
      branch: "",
      avatar_initials: initials,
    });

    if (profileError) {
      return respondCors({ error: profileError.message }, 500);
    }

    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const encoder = new TextEncoder();
    const data = encoder.encode(verificationToken);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map((b: number) => b.toString(16).padStart(2, "0")).join("");

    const { error: tokenError } = await adminClient
      .from("profiles")
      .update({ verification_token_hash: tokenHash })
      .eq("id", userId);

    if (tokenError) {
      return respondCors({ error: tokenError.message }, 500);
    }

    const origin = (req.headers.get("origin") || req.headers.get("referer") || "http://localhost:5173").replace(/\/$/, "");
    const verificationLink = `${origin}/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;

    const emailResult = await sendEmailViaResend(
      normalizedEmail,
      "Verify Your Email Address",
      `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Verify Your Email</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verificationLink}" style="background:#003366;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Verify Email</a>
            <p style="color:#888;font-size:12px;">This link expires in 24 hours.</p>
          </body>
        </html>
      `,
      resendApiKey,
      fromEmail,
      fromName
    );

    if (emailResult.error) {
      return respondCors({ error: emailResult.error }, 500);
    }

    return respondCors({ success: true, user_id: userId });
  } catch (err) {
    console.error("Signup function error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return respondCors({ error: message }, 500);
  }
});
