// ==============================================================================
// Tender Corrigendum & Amendment Tracker - Global Configuration Constants
// ==============================================================================

export const CONFIG = {
  APP: {
    NAME: 'Tender Corrigendum & Amendment Tracker',
    VERSION: '1.0.0',
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  SECURITY: {
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    BCRYPT_SALT_ROUNDS: 12,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME_MINUTES: 15,
  },
  DOCUMENTS: {
    MAX_UPLOAD_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
    MAX_PAGES_OCR: 250,
    ALLOWED_MIME_TYPES: ['application/pdf', 'application/zip'],
  },
  COLLECTION: {
    DEFAULT_RATE_LIMIT_DELAY_MS: 2000,
    DEFAULT_MAX_RETRIES: 3,
    USER_AGENT: 'TenderTrackerCollector/1.0 (+http://localhost:3000/bot-info)',
  },
  ERROR_CODES: {
    UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
    FORBIDDEN: 'AUTH_FORBIDDEN',
    TENDER_NOT_FOUND: 'TENDER_NOT_FOUND',
    AMENDMENT_NOT_FOUND: 'AMENDMENT_NOT_FOUND',
    DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
    INVALID_PAYLOAD: 'VALIDATION_FAILED',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  },
} as const;

