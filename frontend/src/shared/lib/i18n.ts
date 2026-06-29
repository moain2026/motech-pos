import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arCommon from '@/locales/ar/common.json';

/**
 * i18n: Arabic default, RTL. Single 'common' namespace for the MVP; split per
 * feature when it grows (STANDARDS/02 §5). No hardcoded strings in JSX.
 */
void i18n.use(initReactI18next).init({
  resources: {
    ar: { common: arCommon },
  },
  lng: 'ar',
  fallbackLng: 'ar',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
});

export default i18n;
