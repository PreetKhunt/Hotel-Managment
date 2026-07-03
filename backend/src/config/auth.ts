export const authConfig = {
  jwt: {
    secret: process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  session: {
    timeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60', 10),
    cookieName: process.env.SESSION_COOKIE_NAME || 'hh_session',
    secureCookie: process.env.NODE_ENV === 'production',
  },
  passwordPolicy: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
    resetExpiryMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES || '15', 10),
  },
  lockoutPolicy: {
    maxAttempts: parseInt(process.env.LOCKOUT_MAX_ATTEMPTS || '5', 10),
    lockDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10),
  },
  features: {
    googleLoginEnabled: process.env.FEATURE_GOOGLE_LOGIN !== 'false',
    emailRegistrationEnabled: process.env.FEATURE_EMAIL_REGISTRATION !== 'false',
    emailVerificationRequired: process.env.FEATURE_EMAIL_VERIFICATION_REQUIRED === 'true',
    passwordLoginEnabled: process.env.FEATURE_PASSWORD_LOGIN !== 'false',
    accountLockoutEnabled: process.env.FEATURE_ACCOUNT_LOCKOUT !== 'false',
  },
};
