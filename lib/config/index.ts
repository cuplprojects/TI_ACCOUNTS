// Config exports for cleaner imports
export * from './auth';
export * from './recaptcha';
export * from './swal';

// Accounts API configuration
export const ACCOUNTS_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
