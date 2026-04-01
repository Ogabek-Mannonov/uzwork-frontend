import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uzTranslation from './locales/uz/translation.json';
import ruTranslation from './locales/ru/translation.json';
import enTranslation from './locales/en/translation.json';

const resources = {
  uz: {
    translation: uzTranslation
  },
  ru: {
    translation: ruTranslation
  },
  en: {
    translation: enTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('appLanguage') || 'uz', // Default til
    fallbackLng: 'en', // Xatolik bersa Inglizcha
    interpolation: {
      escapeValue: false // React xss dan o'zi himoyalaydi
    }
  });

export default i18n;
