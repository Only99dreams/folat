import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
const FROM_NAME = Deno.env.get("FROM_NAME") || "FOLAT Multipurpose Investment";

interface EmailRequest {
  to: string | string[];
  subject: string;
  template: string;
  variables?: Record<string, any>;
  replyTo?: string;
}

// Email templates
const emailTemplates: Record<string, (vars: Record<string, any>) => string> = {
  welcome: (vars) => `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to FOLAT, ${vars.fullName}!</h2>
        <p>Thank you for joining FOLAT Multipurpose Investment.</p>
        <p>Your role: <strong>${vars.role}</strong></p>
        <p>
          <a href="${vars.loginUrl}" style="background-color: #003366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Go to Dashboard
          </a>
        </p>
      </body>
    </html>
  `,

  "password-reset": (vars) => `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Reset Your Password</h2>
        <p>Click below to reset your password. Link expires in ${vars.expiryTime}.</p>
        <a href="${vars.resetUrl}" style="background:#003366;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
      </body>
    </html>
  `,

  "email-verification": (vars) => `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Verify Email</h2>
        <p>Please verify your email address.</p>
        <a href="${vars.verificationLink}" style="background:#003366;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Verify Email
        </a>
      </body>
    </html>
  `,

  "general-notification": (vars) => `
    <html>
      <body>
        <h2>${vars.subject || "Notification"}</h2>
        <p>${vars.message || ""}</p>
      </body>
    </html>
  `,
};

async function sendEmailViaResend(
  to: string[],
  subject: string,
  html: string,
  replyTo?: string
): Promise<{ messageId?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    return { error: "RESEND_API_KEY not configured" };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
        reply_to: replyTo,
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
    return {
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { to, subject, template, variables = {}, replyTo } =
      (await req.json()) as EmailRequest;

    if (!to || !subject || !template) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const templateFn = emailTemplates[template];

    if (!templateFn) {
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const html = templateFn(variables);
    const recipients = Array.isArray(to) ? to : [to];

    const result = await sendEmailViaResend(
      recipients,
      subject,
      html,
      replyTo
    );

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Function error:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});