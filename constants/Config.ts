import { APP_CONFIG } from '@/config/app';

const WEB_URL = new URL(APP_CONFIG.termsUrl).origin;

const WEB_URL_TERMS = APP_CONFIG.termsUrl;
const WEB_URL_PRIVACY = APP_CONFIG.privacyUrl;

export { WEB_URL, WEB_URL_PRIVACY, WEB_URL_TERMS };
