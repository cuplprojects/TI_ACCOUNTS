import { RECAPTCHA_SITE_KEY } from './auth';

export const loadRecaptchaScript = () => {
  if (typeof window !== 'undefined' && !window.grecaptcha) {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
};

export const executeRecaptcha = async (action: string = 'submit'): Promise<string> => {
  if (typeof window === 'undefined' || !window.grecaptcha) {
    throw new Error('reCAPTCHA not loaded');
  }

  try {
    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    return token;
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    throw error;
  }
};

declare global {
  interface Window {
    grecaptcha: any;
  }
}
