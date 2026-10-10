/**
 * Password Reset Service
 * Handles password reset flows with Resend email integration
 */

import { supabase } from "./supabase";

/**
 * Initiate password reset for user
 * Uses edge function to generate reset link and send via Resend
 */
export async function initiatePasswordReset(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.functions.invoke("reset-password", {
      body: {
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      },
    });

    if (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: error.message || "Failed to initiate password reset",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Password reset error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Password reset failed",
    };
  }
}

/**
 * Update password after reset
 */
export async function updatePassword(newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update password",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Update password error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Password update failed",
    };
  }
}
