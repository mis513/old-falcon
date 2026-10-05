import type { User } from 'firebase/auth';

// Only these accounts may use the app; anyone else is signed out immediately.
// The email must be verified (Google sign-in), so nobody can slip in with an
// unverified address.
export const ALLOWED_EMAILS = ['mis@ceedee.in', 'shubham@ceedee.in', 'falcon390overseas@gmail.com'];

export const isAllowedUser = (user: User | null) =>
  !!user && user.emailVerified && ALLOWED_EMAILS.includes((user.email || '').trim().toLowerCase());
