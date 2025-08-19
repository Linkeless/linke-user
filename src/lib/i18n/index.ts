/**
 * i18n configuration for the application
 *
 * This module sets up internationalization using react-i18next with
 * support for language detection and resource loading.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enCommon from '../../locales/en/common.json';
import enNavigation from '../../locales/en/navigation.json';
import enDashboard from '../../locales/en/dashboard.json';
import enAuth from '../../locales/en/auth.json';
import enSubscription from '../../locales/en/subscription.json';
import enNotifications from '../../locales/en/notifications.json';
import enTickets from '../../locales/en/tickets.json';
import enOrder from '../../locales/en/order.json';

import zhCommon from '../../locales/zh/common.json';
import zhNavigation from '../../locales/zh/navigation.json';
import zhDashboard from '../../locales/zh/dashboard.json';
import zhAuth from '../../locales/zh/auth.json';
import zhSubscription from '../../locales/zh/subscription.json';
import zhNotifications from '../../locales/zh/notifications.json';
import zhTickets from '../../locales/zh/tickets.json';
import zhOrder from '../../locales/zh/order.json';

// Define resources
const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    dashboard: enDashboard,
    auth: enAuth,
    subscription: enSubscription,
    notifications: enNotifications,
    tickets: enTickets,
    order: enOrder,
  },
  zh: {
    common: zhCommon,
    navigation: zhNavigation,
    dashboard: zhDashboard,
    auth: zhAuth,
    subscription: zhSubscription,
    notifications: zhNotifications,
    tickets: zhTickets,
    order: zhOrder,
  },
} as const;

// Configure i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Resources
    resources,

    // Default language
    lng: 'zh', // Default to Chinese as the app originally had Chinese navigation

    // Fallback language
    fallbackLng: 'en',

    // Default namespace
    defaultNS: 'common',

    // Enable debug in development
    debug: import.meta.env.DEV,

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React options
    react: {
      useSuspense: false, // Disable suspense for better initial loading
    },
  });

// Export configured i18n instance
export default i18n;

// Type definitions for better TypeScript support
export type SupportedLanguages = 'en' | 'zh';
export type Namespaces =
  | 'common'
  | 'navigation'
  | 'dashboard'
  | 'auth'
  | 'subscription'
  | 'notifications'
  | 'tickets'
  | 'order';
