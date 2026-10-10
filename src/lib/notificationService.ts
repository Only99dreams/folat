/**
 * Notifications Service
 * Handles sending various notifications to users via Resend
 */

import { supabase } from "./supabase";

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

interface NotificationResult {
  success: boolean;
  message?: string;
  error?: string;
  failedRecipients?: string[];
}

/**
 * Send bulk notification to multiple users
 */
export async function sendBulkNotification(
  recipients: Array<{ email: string; name: string; variables?: Record<string, any> }>,
  subject: string,
  template: string
): Promise<NotificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("send-bulk-email", {
      body: {
        recipients,
        subject,
        template,
        batchSize: 50,
      } as BulkEmailRequest,
    });

    if (error) {
      console.error("Bulk email error:", error);
      return {
        success: false,
        error: error.message || "Failed to send bulk emails",
      };
    }

    return {
      success: true,
      message: `Sent ${data?.summary?.successful || 0} of ${data?.summary?.total || 0} emails`,
      failedRecipients: data?.results
        ?.filter((r: any) => !r.success)
        .map((r: any) => r.email),
    };
  } catch (err) {
    console.error("Bulk notification error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Notification service error",
    };
  }
}

/**
 * Send maintenance notification to all users
 */
export async function sendMaintenanceNotification(
  startTime: string,
  endTime: string,
  duration: string
): Promise<NotificationResult> {
  try {
    // Fetch all users
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .neq("email", null);

    if (fetchError || !profiles) {
      return {
        success: false,
        error: "Failed to fetch user list",
      };
    }

    const recipients = profiles.map((p: any) => ({
      email: p.email,
      name: p.full_name || "User",
      variables: { startTime, endTime, duration },
    }));

    return sendBulkNotification(recipients, "System Maintenance Notice", "maintenance-notice");
  } catch (err) {
    console.error("Maintenance notification error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send maintenance notification",
    };
  }
}

/**
 * Send announcement to specific role or all users
 */
export async function sendAnnouncement(
  title: string,
  content: string,
  linkUrl?: string,
  linkText?: string,
  roles?: string[]
): Promise<NotificationResult> {
  try {
    // Fetch users - filter by role if provided
    let query = supabase.from("profiles").select("email, full_name");

    if (roles && roles.length > 0) {
      query = query.in("role", roles);
    }

    const { data: profiles, error: fetchError } = await query.neq("email", null);

    if (fetchError || !profiles) {
      return {
        success: false,
        error: "Failed to fetch user list",
      };
    }

    const recipients = profiles.map((p: any) => ({
      email: p.email,
      name: p.full_name || "User",
      variables: {
        title,
        content,
        linkUrl: linkUrl || "",
        linkText: linkText || "Learn More",
      },
    }));

    const subject = `Announcement: ${title}`;
    return sendBulkNotification(recipients, subject, "announcement");
  } catch (err) {
    console.error("Announcement error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send announcement",
    };
  }
}

/**
 * Send custom notification to specific users
 */
export async function sendCustomNotification(
  emails: string[],
  subject: string,
  message: string,
  details?: string
): Promise<NotificationResult> {
  try {
    // Fetch full names for these emails
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email, full_name")
      .in("email", emails);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.email, p.full_name || "User"])
    );

    const recipients = emails.map((email) => ({
      email,
      name: profileMap.get(email) || "User",
      variables: { message, details: details || "" },
    }));

    return sendBulkNotification(recipients, subject, "bulk-notification");
  } catch (err) {
    console.error("Custom notification error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send notification",
    };
  }
}
