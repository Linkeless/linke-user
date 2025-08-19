/**
 * Application configuration constants
 * Centralized access to environment variables with validation
 */

// Helper function to get environment variables with validation
function getEnvVar(key: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[key] || fallback;

  if (!value) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }

  return value;
}

// Helper function to get boolean environment variables
function getEnvBoolean(key: keyof ImportMetaEnv, fallback = false): boolean {
  const value = getEnvVar(key, fallback.toString());
  return value.toLowerCase() === 'true';
}

// Helper function to get numeric environment variables
function getEnvNumber(key: keyof ImportMetaEnv, fallback = 0): number {
  const value = getEnvVar(key, fallback.toString());
  return parseInt(value, 10) || fallback;
}

export const config = {
  // API Configuration
  api: {
    baseUrl: getEnvVar('VITE_API_URL', 'http://localhost:8080/api/v1'),
  },

  // OAuth Configuration (Backend manages OAuth credentials)
  oauth: {
    google: {
      enabled: getEnvBoolean('VITE_ENABLE_OAUTH_GOOGLE', true),
    },
    github: {
      enabled: getEnvBoolean('VITE_ENABLE_OAUTH_GITHUB', true),
    },
    telegram: {
      enabled: getEnvBoolean('VITE_ENABLE_OAUTH_TELEGRAM', true),
    },
  },

  // Application Configuration
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Linke User Portal'),
    domain: getEnvVar('VITE_APP_DOMAIN', 'localhost:5173'),
    enableHttps: getEnvBoolean('VITE_ENABLE_HTTPS', false),
  },

  // Security Configuration
  security: {
    sessionTimeout: getEnvNumber('VITE_SESSION_TIMEOUT', 3600000), // 1 hour in milliseconds
  },

  // Debug Configuration
  debug: {
    enabled: getEnvBoolean('VITE_DEBUG_MODE', false),
    logLevel: getEnvVar('VITE_LOG_LEVEL', 'info') as
      | 'debug'
      | 'info'
      | 'warn'
      | 'error',
  },

  // Development helpers
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validation function to check required environment variables
export function validateConfig(): boolean {
  const requiredVars: Array<{
    key: keyof ImportMetaEnv;
    name: string;
    required: boolean;
  }> = [
    { key: 'VITE_API_URL', name: 'API URL', required: true },
    { key: 'VITE_APP_NAME', name: 'Application Name', required: false },
  ];

  let isValid = true;
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  requiredVars.forEach(({ key, name, required }) => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      if (required) {
        isValid = false;
        missingRequired.push(name);
      } else {
        missingOptional.push(name);
      }
    }
  });

  // Additional API URL validation
  if (config.api.baseUrl) {
    try {
      const url = new URL(config.api.baseUrl);

      // Validate that it has the correct /api/v1 prefix
      if (!config.api.baseUrl.includes('/api/v1')) {
        console.warn(
          'API URL should include /api/v1 prefix for backend compatibility',
        );
      }

      // Validate protocol in production
      if (config.isProduction && url.protocol !== 'https:') {
        console.warn('API URL should use HTTPS in production environment');
      }

      if (config.debug.enabled) {
        console.log('✅ API URL validation passed:', {
          baseUrl: config.api.baseUrl,
          protocol: url.protocol,
          hasApiPrefix: config.api.baseUrl.includes('/api/v1'),
        });
      }
    } catch (_error) {
      console.error('Invalid API URL format:', config.api.baseUrl);
      isValid = false;
      missingRequired.push('Valid API URL format');
    }
  }

  if (missingRequired.length > 0) {
    console.error('Missing required environment variables:', missingRequired);
  }

  if (missingOptional.length > 0 && config.debug.enabled) {
    console.warn('Missing optional environment variables:', missingOptional);
  }

  return isValid;
}

// Log configuration in development mode
if (config.isDevelopment && config.debug.enabled) {
  console.log('Application Configuration:', {
    api: { baseUrl: config.api.baseUrl },
    app: { name: config.app.name, domain: config.app.domain },
    oauth: {
      google: { enabled: config.oauth.google.enabled },
      github: { enabled: config.oauth.github.enabled },
      telegram: { enabled: config.oauth.telegram.enabled },
    },
    debug: config.debug,
  });
}
