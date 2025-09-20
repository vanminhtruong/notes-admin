import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import ngôn ngữ từ các pages
import dashboardEn from '@pages/Dashboard/language/en.json';
import dashboardKo from '@pages/Dashboard/language/ko.json';
import dashboardVi from '@pages/Dashboard/language/vi.json';

import loginEn from '@pages/Login/language/en.json';
import loginKo from '@pages/Login/language/ko.json';
import loginVi from '@pages/Login/language/vi.json';

import notesEn from '@pages/Notes/language/en.json';
import notesKo from '@pages/Notes/language/ko.json';
import notesVi from '@pages/Notes/language/vi.json';

import usersEn from '@pages/Users/language/en.json';
import usersKo from '@pages/Users/language/ko.json';
import usersVi from '@pages/Users/language/vi.json';

import adminsEn from '@pages/Admins/language/en.json';
import adminsKo from '@pages/Admins/language/ko.json';
import adminsVi from '@pages/Admins/language/vi.json';

// Common translations
import commonEn from './locales/en/common.json';
import commonKo from './locales/ko/common.json';
import commonVi from './locales/vi/common.json';

const resources = {
  en: {
    common: commonEn,
    dashboard: dashboardEn,
    login: loginEn,
    notes: notesEn,
    users: usersEn,
    admins: adminsEn
  },
  ko: {
    common: commonKo,
    dashboard: dashboardKo,
    login: loginKo,
    notes: notesKo,
    users: usersKo,
    admins: adminsKo
  },
  vi: {
    common: commonVi,
    dashboard: dashboardVi,
    login: loginVi,
    notes: notesVi,
    users: usersVi,
    admins: adminsVi
  }
};

const initI18n = async () => {
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'vi',
      debug: process.env.NODE_ENV === 'development',
      
      // Namespace mặc định
      defaultNS: 'common',
      ns: ['common', 'dashboard', 'login', 'notes', 'users', 'admins'],

      interpolation: {
        escapeValue: false, // React đã escape
      },

      detection: {
        order: ['cookie', 'navigator', 'htmlTag'],
        caches: [],
        lookupCookie: 'lang'
      }
    });
  
  return i18n;
};

// Initialize immediately
initI18n().catch(console.error);

export default i18n;
