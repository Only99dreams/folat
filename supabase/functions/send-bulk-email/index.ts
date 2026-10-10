import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
const FROM_NAME = Deno.env.get("FROM_NAME") || "FOLAT Multipurpose Investment";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface BulkEmailRequest {
  recipients: Array<{
    email: string;
    name: string;
    variables?: Record<string, any>;
  }>;
  subject: string;
  template: string;
  batchSize?: number;
}

interface EmailResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

// Email templates
const emailTemplates: Record<string, (vars: Record<string, any>) => string> = {
  "bulk-notification": (vars) => `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${vars.name},</h2>
        <p>${vars.message}</p>
        <p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${vars.details || ""}
        </p>
        <p>Thank you for using FOLAT Multipurpose Investment.</p>
      </body>
    </html>
  `,

  "maintenance-notice": (vars) => `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>System Maintenance Notice</h2>
        <p>Hi ${vars.name},</p>
        <p>We'll be performing scheduled maintenance on our system.</p>
        <ul style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
          <li><strong>Start Time:</strong> ${vars.startTime}</li>
          <li><strong>End Time:</strong> ${vars.endTime}</li>
          <li><strong>Duration:</strong> ${vars.duration}</li>
        </ul>
        <p>We apologize for any inconvenience this may cause.</p>
      </body>
    </html>
  `,

  "announcement": (vars) => `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>${vars.title}</h2>
        <p>Hi ${vars.name},</p>
        <p>${vars.content}</p>
        <p style="margin-top: 20px;">
          <a href="${vars.linkUrl}" style="background-color: #003366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            ${vars.linkText || "Learn More"}
          </a>
        </p>
      </body>
    </html>
  `,
};

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

async function processBatch(
  recipients: Array<{ email: string; name: string; variables?: Record<string, any> }>,
  subject: string,
  template: string,
  templateFn: (vars: Record<string, any>) => string
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];

  for (const recipient of recipients) {
    try {
      const html = templateFn({
        name: recipient.name,
        ...recipient.variables,
      });

      const result = await sendEmailViaResend(recipient.email, subject, html);

      results.push({
        email: recipient.email,
        success: !result.error,
        messageId: result.messageId,
        error: result.error,
      });

      // Rate limiting - small delay between sends
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      results.push({
        email: recipient.email,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const requestData = (await req.json()) as BulkEmailRequest;
    const { recipients, subject, template, batchSize = 50 } = requestData;

    // Validate required fields
    if (!recipients || recipients.length === 0 || !subject || !template) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: recipients, subject, template",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get template function
    const templateFn = emailTemplates[template];
    if (!templateFn) {
      return new Response(
        JSON.stringify({ error: `Template '${template}' not found` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process in batches
    const allResults: EmailResult[] = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchResults = await processBatch(batch, subject, template, templateFn);
      allResults.push(...batchResults);

      // Delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Summary
    const successful = allResults.filter((r) => r.success).length;
    const failed = allResults.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: allResults.length,
          successful,
          failed,
        },
        results: allResults,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
