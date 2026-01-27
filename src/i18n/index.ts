import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import ngôn ngữ từ các pages
import dashboardEn from '@pages/Dashboard/language/en.json';
import dashboardKo from '@pages/Dashboard/language/ko.json';
import dashboardVi from '@pages/Dashboard/language/vi.json';
import dashboardZhCN from '@pages/Dashboard/language/zh-CN.json';
import dashboardZhTW from '@pages/Dashboard/language/zh-TW.json';

import loginEn from '@pages/Login/language/en.json';
import loginKo from '@pages/Login/language/ko.json';
import loginVi from '@pages/Login/language/vi.json';
import loginZhCN from '@pages/Login/language/zh-CN.json';
import loginZhTW from '@pages/Login/language/zh-TW.json';

import notesEn from '@pages/Notes/language/en.json';
import notesKo from '@pages/Notes/language/ko.json';
import notesVi from '@pages/Notes/language/vi.json';
import notesZhCN from '@pages/Notes/language/zh-CN.json';
import notesZhTW from '@pages/Notes/language/zh-TW.json';

import usersEn from '@pages/Users/language/en.json';
import usersKo from '@pages/Users/language/ko.json';
import usersVi from '@pages/Users/language/vi.json';
import usersZhCN from '@pages/Users/language/zh-CN.json';
import usersZhTW from '@pages/Users/language/zh-TW.json';

import adminsEn from '@pages/Admins/language/en.json';
import adminsKo from '@pages/Admins/language/ko.json';
import adminsVi from '@pages/Admins/language/vi.json';
import adminsZhCN from '@pages/Admins/language/zh-CN.json';
import adminsZhTW from '@pages/Admins/language/zh-TW.json';

import profileEn from '@pages/Profile/language/en.json';
import profileKo from '@pages/Profile/language/ko.json';
import profileVi from '@pages/Profile/language/vi.json';
import profileZhCN from '@pages/Profile/language/zh-CN.json';
import profileZhTW from '@pages/Profile/language/zh-TW.json';

import categoriesEn from '@pages/Categories/language/en.json';
import categoriesKo from '@pages/Categories/language/ko.json';
import categoriesVi from '@pages/Categories/language/vi.json';
import categoriesZhCN from '@pages/Categories/language/zh-CN.json';
import categoriesZhTW from '@pages/Categories/language/zh-TW.json';

import backgroundsEn from '@pages/Backgrounds/language/en.json';
import backgroundsKo from '@pages/Backgrounds/language/ko.json';
import backgroundsVi from '@pages/Backgrounds/language/vi.json';
import backgroundsZhCN from '@pages/Backgrounds/language/zh-CN.json';
import backgroundsZhTW from '@pages/Backgrounds/language/zh-TW.json';

import chatSettingsEn from '@pages/Users/ChatSettings/language/en.json';
import chatSettingsKo from '@pages/Users/ChatSettings/language/ko.json';
import chatSettingsVi from '@pages/Users/ChatSettings/language/vi.json';
import chatSettingsZhCN from '@pages/Users/ChatSettings/language/zh-CN.json';
import chatSettingsZhTW from '@pages/Users/ChatSettings/language/zh-TW.json';

import clockEn from '@pages/Clock/language/en.json';
import clockKo from '@pages/Clock/language/ko.json';
import clockVi from '@pages/Clock/language/vi.json';
import clockZhCN from '@pages/Clock/language/zh-CN.json';
import clockZhTW from '@pages/Clock/language/zh-TW.json';

// Common translations
import commonEn from './locales/en/common.json';
import commonKo from './locales/ko/common.json';
import commonVi from './locales/vi/common.json';
import commonZhCN from './locales/zh-CN/common.json';
import commonZhTW from './locales/zh-TW/common.json';

const resources = {
  en: {
    common: commonEn,
    dashboard: dashboardEn,
    login: loginEn,
    notes: notesEn,
    users: usersEn,
    admins: adminsEn,
    profile: profileEn,
    categories: categoriesEn,
    backgrounds: backgroundsEn,
    chatSettings: chatSettingsEn,
    clock: clockEn
  },
  ko: {
    common: commonKo,
    dashboard: dashboardKo,
    login: loginKo,
    notes: notesKo,
    users: usersKo,
    admins: adminsKo,
    profile: profileKo,
    categories: categoriesKo,
    backgrounds: backgroundsKo,
    chatSettings: chatSettingsKo,
    clock: clockKo
  },
  vi: {
    common: commonVi,
    dashboard: dashboardVi,
    login: loginVi,
    notes: notesVi,
    users: usersVi,
    admins: adminsVi,
    profile: profileVi,
    categories: categoriesVi,
    backgrounds: backgroundsVi,
    chatSettings: chatSettingsVi,
    clock: clockVi
  },
  'zh-CN': {
    common: commonZhCN,
    dashboard: dashboardZhCN,
    login: loginZhCN,
    notes: notesZhCN,
    users: usersZhCN,
    admins: adminsZhCN,
    profile: profileZhCN,
    categories: categoriesZhCN,
    backgrounds: backgroundsZhCN,
    chatSettings: chatSettingsZhCN,
    clock: clockZhCN
  },
  'zh-TW': {
    common: commonZhTW,
    dashboard: dashboardZhTW,
    login: loginZhTW,
    notes: notesZhTW,
    users: usersZhTW,
    admins: adminsZhTW,
    profile: profileZhTW,
    categories: categoriesZhTW,
    backgrounds: backgroundsZhTW,
    chatSettings: chatSettingsZhTW,
    clock: clockZhTW
  }
};

// Hàm đọc cookie trực tiếp
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Lấy ngôn ngữ từ cookie trước khi khởi tạo i18n để tránh flash
const getInitialLanguage = (): string => {
  const cookieLang = getCookie('lang');
  if (cookieLang) {
    // Giữ nguyên zh-CN và zh-TW
    if (cookieLang.startsWith('zh')) {
      if (cookieLang.toLowerCase().includes('tw') || cookieLang.toLowerCase().includes('hant') || cookieLang.toLowerCase().includes('hk')) {
        return 'zh-TW';
      }
      return 'zh-CN';
    }
    // Normalize các ngôn ngữ khác
    const normalized = cookieLang.split('-')[0];
    if (['en', 'ko', 'vi'].includes(normalized)) {
      return normalized;
    }
  }
  return 'vi'; // Fallback
};

const initI18n = async () => {
  const initialLang = getInitialLanguage();
  
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: 'vi',
      supportedLngs: ['en', 'ko', 'vi', 'zh-CN', 'zh-TW'],
      load: 'currentOnly',
      debug: process.env.NODE_ENV === 'development',
      
      // Namespace mặc định
      defaultNS: 'common',
      ns: ['common', 'dashboard', 'login', 'notes', 'users', 'admins', 'profile', 'categories', 'backgrounds', 'chatSettings', 'clock'],

      interpolation: {
        escapeValue: false, // React đã escape
      },

      detection: {
        order: ['cookie', 'navigator', 'htmlTag'],
        caches: [],
        lookupCookie: 'lang',
        convertDetectedLanguage: (lng: string) => {
          // Giữ nguyên zh-CN và zh-TW, không normalize
          if (lng.startsWith('zh')) {
            if (lng.toLowerCase().includes('tw') || lng.toLowerCase().includes('hant') || lng.toLowerCase().includes('hk')) {
              return 'zh-TW';
            }
            return 'zh-CN';
          }
          return lng.split('-')[0];
        }
      }
    });
  
  return i18n;
};

// Initialize immediately
initI18n().catch(console.error);

export default i18n;
