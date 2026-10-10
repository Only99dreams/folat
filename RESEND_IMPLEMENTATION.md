# Resend Integration Implementation Guide

This document summarizes all changes made to integrate Resend email service into FOLAT.

## Files Created

### 1. Email Service Utilities

**`src/lib/emailService.ts`**
- Main email service interface
- Individual email functions for different scenarios:
  - `sendWelcomeEmail()` - New user welcome
  - `sendPasswordResetEmail()` - Password reset links
  - `sendEmailVerificationEmail()` - Email verification
  - `sendLoanApplicationNotification()` - Loan status updates
  - `sendWithdrawalNotification()` - Withdrawal status updates
  - `sendLoanRepaymentDueEmail()` - Payment reminders
  - `sendAccountLockedEmail()` - Account lock notices
  - `sendDepositConfirmationEmail()` - Deposit confirmations
  - `sendEmail()` - Generic email sender (used by all above)

**`src/lib/passwordReset.ts`**
- Password reset flow management
- Functions:
  - `initiatePasswordReset()` - Start password reset process
  - `updatePassword()` - Complete password change

**`src/lib/notificationService.ts`**
- Bulk notification system
- Functions:
  - `sendBulkNotification()` - Send to multiple recipients
  - `sendMaintenanceNotification()` - System maintenance alerts
  - `sendAnnouncement()` - Role-based announcements
  - `sendCustomNotification()` - Custom bulk messages

### 2. Supabase Edge Functions

**`supabase/functions/send-email/index.ts`**
- Main email sending function using Resend API
- 11 built-in email templates:
  - welcome
  - password-reset
  - email-verification
  - loan-application-approved
  - loan-application-rejected
  - withdrawal-approved
  - withdrawal-rejected
  - loan-repayment-due
  - deposit-confirmation
  - account-locked
  - general-notification

**`supabase/functions/send-bulk-email/index.ts`**
- Bulk email sending with batching
- 3 templates for bulk operations:
  - bulk-notification (custom messages)
  - maintenance-notice (system maintenance)
  - announcement (general announcements)
- Rate limiting and batch processing (50 emails at a time)

### 3. Configuration Files

**`.env.local.example`**
- Template for environment variables
- Required secrets:
  - `VITE_RESEND_API_KEY` - Resend API key
  - `VITE_FROM_EMAIL` - Sender email address
  - `VITE_FROM_NAME` - Sender display name
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anon key

### 4. Documentation

**`RESEND_SETUP.md`**
- Complete setup guide
- Usage examples
- Integration points
- Testing instructions
- Troubleshooting tips

## Code Changes

### Authentication Flow Updates

**`src/auth/AuthContext.tsx`**

Changes:
1. Imported `sendWelcomeEmail` from emailService
2. Added welcome email sending to signup flow:
   ```typescript
   // Send welcome email
   try {
     await sendWelcomeEmail(email, fullName, "unassigned");
   } catch (emailErr) {
     console.error("Failed to send welcome email:", emailErr);
     /* Don't fail signup if email fails */
   }
   ```

**`src/components/ForgotPasswordPage.tsx`**

Changes:
1. Replaced `supabase.auth.resetPasswordForEmail` with `initiatePasswordReset`
2. Now uses new password reset service that:
   - Triggers Supabase auth reset (for security)
   - Sends branded email via Resend
   - Better error handling with network retry logic

## How It Works

### Email Flow Diagram

```
User Action (signup, password reset, etc.)
    ↓
Client Code (src/lib/emailService.ts)
    ↓
Supabase Edge Function
    ↓
Resend API
    ↓
User Inbox
```

### Password Reset Flow

```
1. User clicks "Forgot Password" on login page
   ↓
2. ForgotPasswordPage calls initiatePasswordReset()
   ↓
3. passwordReset service:
   a) Calls Supabase auth.resetPasswordForEmail() (Supabase sends email)
   b) Fetches user's full name from profiles table
   c) Sends branded email via Resend edge function
   ↓
4. User receives email from Resend with branded template
   ↓
5. User clicks link to return to /reset-password
   ↓
6. User submits new password → updatePassword() called
   ↓
7. Supabase updates password in auth system
```

### New User Registration Flow

```
1. User fills signup form in LoginPage/RegisterPage
   ↓
2. AuthContext.signup() called with email, password, fullName
   ↓
3. Supabase creates auth user
   ↓
4. Code creates profiles table entry
   ↓
5. sendWelcomeEmail() called via emailService
   ↓
6. Supabase edge function send-email invoked
   ↓
7. Edge function sends email via Resend API
   ↓
8. User receives welcome email with login link
```

## Integration Checklist

To fully integrate Resend into your workflows:

### Required
- [ ] Set up Resend account and get API key
- [ ] Configure `.env.local` with Resend API key
- [ ] Deploy Supabase edge functions: `send-email` and `send-bulk-email`
- [ ] Set Supabase secrets: `RESEND_API_KEY`, `FROM_EMAIL`, `FROM_NAME`
- [ ] Test welcome email on signup
- [ ] Test password reset email flow

### Recommended
- [ ] Add loan notification integration
- [ ] Add withdrawal notification integration
- [ ] Set up scheduled payment reminders (cron job)
- [ ] Add role-based announcements
- [ ] Create maintenance notification workflow

### Optional
- [ ] Add SMS notifications
- [ ] Create email template editor
- [ ] Set up analytics/tracking
- [ ] Create email preference center

## Usage Examples

### Send Email on Loan Approval

```typescript
// In your loan approval handler
import { sendLoanApplicationNotification } from "@/lib/emailService";

async function approveLoan(loanId: string) {
  // ... approval logic ...
  
  const loan = await getLoan(loanId);
  const member = await getMember(loan.member_id);
  
  await sendLoanApplicationNotification(
    member.email,
    member.full_name,
    "approved",
    loan.amount,
    "Your loan has been approved. Funds will be disbursed within 24 hours."
  );
}
```

### Send Bulk Announcement

```typescript
// In admin panel or backend service
import { sendAnnouncement } from "@/lib/notificationService";

async function announceNewFeature() {
  await sendAnnouncement(
    "New Loan Tracking Dashboard",
    "We've launched an enhanced loan tracking dashboard with real-time updates.",
    "https://app.folat.org/dashboard/loans/new",
    "View Dashboard",
    ["branch_manager", "loan_officer", "finance_officer"]
  );
}
```

### Manual Payment Reminder (Daily Cron)

```typescript
// Backend cron job or scheduled task
import { sendLoanRepaymentDueEmail } from "@/lib/emailService";
import { supabase } from "@/lib/supabase";

async function sendPaymentReminders() {
  const today = new Date().toISOString().split('T')[0];
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Get all repayments due in next 3 days
  const { data: dueRepayments } = await supabase
    .from("loan_repayments")
    .select("*, loan_applications(member_id)")
    .lte("due_date", threeDaysFromNow)
    .gte("due_date", today)
    .eq("status", "pending");

  for (const repayment of dueRepayments || []) {
    const member = await getMember(repayment.loan_applications.member_id);
    
    await sendLoanRepaymentDueEmail(
      member.email,
      member.full_name,
      repayment.loan_id,
      repayment.amount,
      repayment.due_date
    );
  }
}
```

## Database Schema Needed (Optional)

Add to track email sends (optional audit trail):

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  recipient_email TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- sent, failed, bounced
  message_id TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at);
```

## Environment Variables Summary

```bash
# .env.local file
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
VITE_FROM_EMAIL=noreply@folat.org
VITE_FROM_NAME=FOLAT Multipurpose Investment
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Supabase secrets (set via dashboard)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@folat.org
FROM_NAME=FOLAT Multipurpose Investment
```

## Testing Commands

```bash
# Deploy functions
supabase functions deploy send-email
supabase functions deploy send-bulk-email

# Set secrets
supabase secrets set RESEND_API_KEY=re_your_key_here

# View function logs
supabase functions list
supabase functions download send-email

# Test locally
npm run dev
# Sign up new user → should receive welcome email
# Click forgot password → should receive reset email
```

## Next Steps

1. **Sign up for Resend**: Go to [resend.com](https://resend.com)
2. **Get API Key**: Create an API key in dashboard
3. **Configure Email**: Add your domain and verify email address
4. **Update .env.local**: Copy `.env.local.example` and add your credentials
5. **Deploy Functions**: Run `supabase functions deploy`
6. **Set Secrets**: Run `supabase secrets set`
7. **Test**: Sign up and verify welcome email arrives
8. **Implement**: Add more email integrations as needed

## Troubleshooting

See `RESEND_SETUP.md` for detailed troubleshooting guide.

Common issues:
- **Email not sending**: Check Resend API key and FROM_EMAIL domain
- **Function errors**: Check Supabase function logs
- **Rate limiting**: Add delays between bulk sends (already implemented)
- **Template errors**: Verify template names match exactly

## Support

- Resend Docs: https://resend.com/docs
- Supabase Functions: https://supabase.com/docs/guides/functions
- FOLAT Team: [Your contact info]
