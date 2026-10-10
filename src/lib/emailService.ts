/**
 * Email Service - Using Resend for email sending
 * This utility interfaces with Supabase Edge Functions to send emails
 */

import { supabase } from "./supabase";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  variables?: Record<string, any>;
  replyTo?: string;
}

export type EmailTemplate =
  | "welcome"
  | "password-reset"
  | "password-reset-confirm"
  | "email-verification"
  | "loan-application-approved"
  | "loan-application-rejected"
  | "withdrawal-approved"
  | "withdrawal-rejected"
  | "loan-repayment-due"
  | "deposit-confirmation"
  | "account-locked"
  | "general-notification";

/**
 * Send email via Supabase Edge Function (powered by Resend)
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        to: options.to,
        subject: options.subject,
        template: options.template,
        variables: options.variables || {},
        replyTo: options.replyTo,
      },
    });

    if (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: data?.messageId,
    };
  } catch (err) {
    console.error("Email service error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Email service error",
    };
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string,
  role: string
) {
  return sendEmail({
    to: email,
    subject: "Welcome to FOLAT Multipurpose Investment",
    template: "welcome",
    variables: {
      fullName,
      role,
      loginUrl: `${window.location.origin}/login`,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "Reset Your FOLAT Password",
    template: "password-reset",
    variables: {
      resetUrl,
      expiryTime: "1 hour",
    },
  });
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(
  email: string,
  verificationLink: string
) {
  return sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    template: "email-verification",
    variables: {
      verificationLink,
      expiryTime: "24 hours",
    },
  });
}

/**
 * Send loan application notification
 */
export async function sendLoanApplicationNotification(
  email: string,
  fullName: string,
  status: "approved" | "rejected" | "pending",
  loanAmount?: number,
  message?: string
) {
  const template =
    status === "approved"
      ? "loan-application-approved"
      : status === "rejected"
        ? "loan-application-rejected"
        : "general-notification";

  return sendEmail({
    to: email,
    subject: `Loan Application ${status.toUpperCase()}`,
    template,
    variables: {
      fullName,
      loanAmount,
      message,
      dashboardUrl: `${window.location.origin}/dashboard`,
    },
  });
}

/**
 * Send withdrawal notification
 */
export async function sendWithdrawalNotification(
  email: string,
  fullName: string,
  status: "approved" | "rejected" | "processing",
  amount?: number,
  message?: string
) {
  const template =
    status === "approved"
      ? "withdrawal-approved"
      : status === "rejected"
        ? "withdrawal-rejected"
        : "general-notification";

  return sendEmail({
    to: email,
    subject: `Withdrawal Request ${status.toUpperCase()}`,
    template,
    variables: {
      fullName,
      amount,
      message,
      estimatedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toLocaleDateString(),
    },
  });
}

/**
 * Send loan repayment due notification
 */
export async function sendLoanRepaymentDueEmail(
  email: string,
  fullName: string,
  loanId: string,
  amount: number,
  dueDate: string
) {
  return sendEmail({
    to: email,
    subject: "Loan Repayment Due Reminder",
    template: "loan-repayment-due",
    variables: {
      fullName,
      loanId,
      amount,
      dueDate,
      dashboardUrl: `${window.location.origin}/dashboard/loans`,
    },
  });
}

/**
 * Send account locked notification
 */
export async function sendAccountLockedEmail(email: string, fullName: string) {
  return sendEmail({
    to: email,
    subject: "Your Account Has Been Locked",
    template: "account-locked",
    variables: {
      fullName,
      supportEmail: "support@folat.org",
    },
  });
}

/**
 * Send deposit confirmation email
 */
export async function sendDepositConfirmationEmail(
  email: string,
  fullName: string,
  amount: number,
  transactionId: string,
  date: string
) {
  return sendEmail({
    to: email,
    subject: "Deposit Confirmation",
    template: "deposit-confirmation",
    variables: {
      fullName,
      amount,
      transactionId,
      date,
      dashboardUrl: `${window.location.origin}/dashboard/deposits`,
    },
  });
}
