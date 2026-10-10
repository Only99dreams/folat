/**
 * Email Validation Rules for FOLAT System
 * - Only FOLAT organization emails are allowed
 * - Exception: ogiethompson11@gmail.com (superadmin)
 */

const SUPERADMIN_EMAIL = "ogiethompson11@gmail.com";
const ALLOWED_DOMAINS = ["folat.com", "coop.com"];

export function isEmailAllowed(email: string): boolean {
  const trimmedEmail = email.trim().toLowerCase();

  // Allow superadmin exception
  if (trimmedEmail === SUPERADMIN_EMAIL) {
    return true;
  }

  // Check if email has valid format
  if (!trimmedEmail.includes("@")) {
    return false;
  }

  // Extract domain
  const domain = trimmedEmail.split("@")[1];

  // Check if domain is in allowed list or contains "folat"
  return ALLOWED_DOMAINS.includes(domain) || domain.includes("folat");
}

export function getEmailValidationError(email: string): string | null {
  if (!email.trim()) {
    return "Please enter an email address.";
  }

  if (!email.includes("@")) {
    return "Please enter a valid email address.";
  }

  if (!isEmailAllowed(email)) {
    return "Only FOLAT organization email addresses are allowed. Contact support if you need access.";
  }

  return null;
}
