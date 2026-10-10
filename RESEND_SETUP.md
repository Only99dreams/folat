# Resend Email Setup Guide

This guide walks you through setting up Resend for all email notifications in the FOLAT system.

## Overview

The email system uses:
- **Resend** - Email sending service (via API)
- **Supabase Edge Functions** - Serverless functions to send emails
- **Custom Email Service** - TypeScript utilities for easy email sending

## Setup Steps

### 1. Get Resend API Key

1. Visit [resend.com](https://resend.com)
2. Sign up or log in
3. Go to Dashboard → API Keys
4. Create a new API key (keep it secure!)
5. Add your domain and configure email authentication

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy from .env.local.example
cp .env.local.example .env.local
```

Add your configuration:

```env
# Resend API Key
VITE_RESEND_API_KEY=re_your_api_key_here

# Email Settings
VITE_FROM_EMAIL=noreply@folat.org
VITE_FROM_NAME=FOLAT Multipurpose Investment

# Supabase URLs (already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy Supabase Edge Functions

The edge functions handle the actual email sending:

```bash
# Deploy send-email function
supabase functions deploy send-email

# Deploy send-bulk-email function (for mass notifications)
supabase functions deploy send-bulk-email
```

Set secrets in Supabase Dashboard:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set FROM_EMAIL=noreply@folat.org
supabase secrets set FROM_NAME="FOLAT Multipurpose Investment"
```

### 4. Verify Email Configuration

Make sure your Supabase project has these environment variables:

```
RESEND_API_KEY
FROM_EMAIL
FROM_NAME
SUPABASE_URL (for local dev)
SUPABASE_SERVICE_ROLE_KEY (for local dev)
```

## Email Services Available

### Individual Email Functions

```typescript
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendLoanApplicationNotification,
  sendWithdrawalNotification,
  sendLoanRepaymentDueEmail,
  sendAccountLockedEmail,
  sendDepositConfirmationEmail,
} from "@/lib/emailService";

// Send welcome email to new user
await sendWelcomeEmail("user@folat.org", "John Doe", "staff_member");

// Send password reset
await sendPasswordResetEmail("user@folat.org", "https://app.folat.org/reset-password?token=xxx");

// Send loan approval notification
await sendLoanApplicationNotification(
  "user@folat.org",
  "John Doe",
  "approved",
  1000000,
  "Your loan has been approved!"
);
```

### Bulk Notifications

```typescript
import {
  sendBulkNotification,
  sendMaintenanceNotification,
  sendAnnouncement,
  sendCustomNotification,
} from "@/lib/notificationService";

// Send maintenance notice to all users
await sendMaintenanceNotification(
  "2024-06-01 02:00 AM UTC",
  "2024-06-01 04:00 AM UTC",
  "2 hours"
);

// Send announcement to specific roles
await sendAnnouncement(
  "New Loan Products",
  "We're excited to announce new loan products available for all members.",
  "https://app.folat.org/loans/new-products",
  "View Products",
  ["branch_manager", "loan_officer"]
);

// Send custom notification to specific users
await sendCustomNotification(
  ["user1@folat.org", "user2@folat.org"],
  "Important Update",
  "Please update your account information.",
  "Your account needs attention."
);
```

### Password Reset

```typescript
import { initiatePasswordReset, updatePassword } from "@/lib/passwordReset";

// User requests password reset
await initiatePasswordReset("user@folat.org");

// User submits new password (on reset page)
await updatePassword("newPassword123!");
```

## Email Templates

The system includes pre-built templates for:

- **welcome** - Welcome new users
- **password-reset** - Password reset instructions
- **email-verification** - Email verification links
- **loan-application-approved** - Loan approval notifications
- **loan-application-rejected** - Loan rejection notifications
- **withdrawal-approved** - Withdrawal approval confirmations
- **withdrawal-rejected** - Withdrawal rejection notifications
- **loan-repayment-due** - Payment due reminders
- **deposit-confirmation** - Deposit confirmation receipts
- **account-locked** - Account locked warnings
- **maintenance-notice** - System maintenance notifications
- **announcement** - General announcements
- **bulk-notification** - Custom bulk notifications
- **general-notification** - Generic notification template

## Integration Points

### User Registration
- Automatically sends welcome email
- Location: `src/auth/AuthContext.tsx`

### Password Reset
- Sends password reset email via Resend
- Location: `src/components/ForgotPasswordPage.tsx`

### Loan Application Status
Add to your loan application approval/rejection handlers:

```typescript
import { sendLoanApplicationNotification } from "@/lib/emailService";

// When loan is approved
await sendLoanApplicationNotification(email, fullName, "approved", loanAmount);

// When loan is rejected
await sendLoanApplicationNotification(email, fullName, "rejected", 0, rejectionReason);
```

### Withdrawals
Add to your withdrawal handlers:

```typescript
import { sendWithdrawalNotification } from "@/lib/emailService";

// When withdrawal is approved
await sendWithdrawalNotification(email, fullName, "approved", amount);

// When withdrawal is rejected
await sendWithdrawalNotification(email, fullName, "rejected", amount, rejectionReason);
```

### Payment Reminders
Add to your scheduled task (e.g., daily cron job):

```typescript
import { sendLoanRepaymentDueEmail } from "@/lib/emailService";

// Send reminders for loans due in next 3 days
const dueSoon = await supabase
  .from("loan_repayments")
  .select("*")
  .lte("due_date", tomorrow)
  .gte("due_date", today);

for (const repayment of dueSoon) {
  await sendLoanRepaymentDueEmail(
    memberEmail,
    memberName,
    repayment.loan_id,
    repayment.amount,
    repayment.due_date
  );
}
```

## Testing

### Send Test Email

Use the Supabase Dashboard to test the edge functions:

1. Go to Supabase Dashboard → Functions
2. Select `send-email`
3. Click "Invoke" and provide test payload:

```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "template": "welcome",
  "variables": {
    "fullName": "John Doe",
    "role": "staff_member",
    "loginUrl": "https://app.folat.org/login"
  }
}
```

### Troubleshooting

**Email not sending:**
- Check Supabase logs for edge function errors
- Verify RESEND_API_KEY is set correctly
- Check email address format is valid
- Verify FROM_EMAIL domain is verified in Resend

**Images not showing:**
- Use absolute URLs (https://...) not relative paths
- Inline CSS for better email client compatibility

**Rate limiting:**
- Resend allows ~500 emails/sec
- Bulk email function automatically batches requests (50 at a time)
- Add delays between batch sends if needed

## Development

### Local Testing

To test edge functions locally:

```bash
# Start Supabase locally
supabase start

# Test send-email function
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@folat.org",
    "subject": "Test",
    "template": "welcome",
    "variables": {"fullName": "Test User", "role": "staff_member", "loginUrl": "http://localhost:5173/login"}
  }'
```

### Custom Templates

To add new email templates, edit:
- Client: `src/lib/emailService.ts` - Add function
- Edge function: `supabase/functions/send-email/index.ts` - Add HTML template

Template example:

```typescript
// In send-email/index.ts emailTemplates
"custom-template": (vars) => `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hello ${vars.fullName}!</h2>
      <p>${vars.message}</p>
    </body>
  </html>
`,

// In emailService.ts
export async function sendCustomEmail(email: string, fullName: string, message: string) {
  return sendEmail({
    to: email,
    subject: "Custom Message",
    template: "custom-template",
    variables: { fullName, message },
  });
}
```

## Support

For issues with:
- **Resend**: Check [resend.com/docs](https://resend.com/docs)
- **Supabase Edge Functions**: See [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **FOLAT**: Contact your development team
