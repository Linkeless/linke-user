/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string;

  // OAuth Configuration
  readonly VITE_OAUTH_GOOGLE_CLIENT_ID: string;
  readonly VITE_OAUTH_GITHUB_CLIENT_ID: string;
  readonly VITE_OAUTH_TELEGRAM_CLIENT_ID: string;

  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DOMAIN: string;

  // Security Configuration
  readonly VITE_ENABLE_HTTPS: string;
  readonly VITE_SESSION_TIMEOUT: string;

  // Debug Configuration
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: string;

  // Feature Flags
  readonly VITE_ENABLE_OAUTH_GOOGLE: string;
  readonly VITE_ENABLE_OAUTH_GITHUB: string;
  readonly VITE_ENABLE_OAUTH_TELEGRAM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
