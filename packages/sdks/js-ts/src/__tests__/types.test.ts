import { describe, expect, it } from 'vitest';
import {
  DeepcrawlAuthError,
  DeepcrawlError,
  DeepcrawlInvalidExportFormatError,
  DeepcrawlLinksError,
  DeepcrawlLogsInvalidDateRangeError,
  DeepcrawlLogsInvalidSortError,
  DeepcrawlNetworkError,
  DeepcrawlNotFoundError,
  DeepcrawlRateLimitError,
  DeepcrawlReadError,
  DeepcrawlServerError,
  DeepcrawlValidationError,
} from '../_types';

describe('Error Classes', () => {
  describe('DeepcrawlReadError', () => {
    it('should create read error with data', () => {
      const errorData = {
        requestId: 'req-123',
        success: false as const,
        targetUrl: 'https://example.com',
        timestamp: '2024-01-01T00:00:00Z',
        error: 'Failed to read page',
      };
      const error = new DeepcrawlReadError(errorData);
      expect(error.message).toBe('Failed to read page');
      expect(error.name).toBe('DeepcrawlReadError');
      expect(error.code).toBe('READ_ERROR_RESPONSE');
      expect(error.status).toBe(400);
      expect(error.targetUrl).toBe('https://example.com');
      expect(error.success).toBe(false);
      expect(error).toBeInstanceOf(DeepcrawlError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('DeepcrawlLinksError', () => {
    it('should create links error with data', () => {
      const errorData = {
        requestId: 'req-456',
        success: false as const,
        targetUrl: 'https://example.com',
        timestamp: '2024-01-01T00:00:00Z',
        error: 'Failed to extract links',
      };
      const error = new DeepcrawlLinksError(errorData);
      expect(error.message).toBe('Failed to extract links');
      expect(error.name).toBe('DeepcrawlLinksError');
      expect(error.code).toBe('LINKS_ERROR_RESPONSE');
      expect(error.status).toBe(400);
      expect(error.targetUrl).toBe('https://example.com');
      expect(error.timestamp).toBe('2024-01-01T00:00:00Z');
      expect(error).toBeInstanceOf(DeepcrawlError);
    });
  });

  describe('DeepcrawlAuthError', () => {
    it('should create auth error with message', () => {
      const error = new DeepcrawlAuthError('Invalid API key');
      expect(error.message).toBe('Invalid API key');
      expect(error.name).toBe('DeepcrawlAuthError');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.status).toBe(401);
      expect(error).toBeInstanceOf(DeepcrawlError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have userMessage getter', () => {
      const error = new DeepcrawlAuthError('Invalid API key');
      expect(error.userMessage).toBe('Invalid API key');
    });
  });

  describe('DeepcrawlNetworkError', () => {
    it('should create network error with message', () => {
      const error = new DeepcrawlNetworkError('Connection failed');
      expect(error.message).toBe('Connection failed');
      expect(error.name).toBe('DeepcrawlNetworkError');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.status).toBe(503);
      expect(error).toBeInstanceOf(DeepcrawlError);
    });

    it('should store original error in data', () => {
      const originalError = new Error('Socket timeout');
      const error = new DeepcrawlNetworkError(
        'Connection failed',
        originalError,
      );
      expect(error.data).toEqual({ originalError });
    });
  });

  describe('DeepcrawlRateLimitError', () => {
    it('should create rate limit error with data', () => {
      const error = new DeepcrawlRateLimitError({
        message: 'Rate limit exceeded',
        data: { operation: 'read', retryAfter: 60 },
      });
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('DeepcrawlRateLimitError');
      expect(error.code).toBe('RATE_LIMITED');
      expect(error.status).toBe(429);
      expect(error.operation).toBe('read');
      expect(error.retryAfter).toBe(60);
      expect(error.userMessage).toContain('60 seconds');
      expect(error).toBeInstanceOf(DeepcrawlError);
    });
  });

  describe('DeepcrawlValidationError', () => {
    it('should create validation error with message', () => {
      const error = new DeepcrawlValidationError('Invalid parameters');
      expect(error.message).toBe('Invalid parameters');
      expect(error.name).toBe('DeepcrawlValidationError');
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.status).toBe(400);
      expect(error).toBeInstanceOf(DeepcrawlError);
    });
  });

  describe('DeepcrawlNotFoundError', () => {
    it('should create not found error with message', () => {
      const error = new DeepcrawlNotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('DeepcrawlNotFoundError');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
      expect(error).toBeInstanceOf(DeepcrawlError);
    });
  });

  describe('DeepcrawlServerError', () => {
    it('should create server error with message', () => {
      const error = new DeepcrawlServerError('Internal server error');
      expect(error.message).toBe('Internal server error');
      expect(error.name).toBe('DeepcrawlServerError');
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.status).toBe(500);
      expect(error).toBeInstanceOf(DeepcrawlError);
    });
  });

  describe('DeepcrawlLogsInvalidDateRangeError', () => {
    it('should create date range error with data', () => {
      const errorData = {
        message: 'Invalid date range',
        startDate: '2024-01-01',
        endDate: '2023-12-31',
      };
      const error = new DeepcrawlLogsInvalidDateRangeError(errorData);
      expect(error.message).toBe('Invalid date range');
      expect(error.name).toBe('DeepcrawlLogsInvalidDateRangeError');
      expect(error.code).toBe('LOGS_INVALID_DATE_RANGE');
      expect(error.status).toBe(400);
      expect(error.startDate).toBe('2024-01-01');
      expect(error.endDate).toBe('2023-12-31');
      expect(error).toBeInstanceOf(DeepcrawlError);
    });
  });

  describe('DeepcrawlLogsInvalidSortError', () => {
    it('should create invalid sort error with data', () => {
      const errorData = {
        message: 'Invalid sort field',
        orderBy: 'invalid',
        allowed: ['createdAt', 'path'],
      };
      const error = new DeepcrawlLogsInvalidSortError(errorData);
      expect(error.message).toBe('Invalid sort field');
      expect(error.name).toBe('DeepcrawlLogsInvalidSortError');
      expect(error.code).toBe('LOGS_INVALID_SORT');
      expect(error.status).toBe(400);
      expect(error.orderBy).toBe('invalid');
      expect(error.allowed).toEqual(['createdAt', 'path']);
      expect(error).toBeInstanceOf(DeepcrawlError);
    });
  });

  describe('DeepcrawlInvalidExportFormatError', () => {
    it('should create invalid export format error with data', () => {
      const errorData = {
        message: 'Invalid export format',
        id: 'log-123',
        format: 'invalid',
        path: 'read-getMarkdown',
      };
      const error = new DeepcrawlInvalidExportFormatError(errorData);
      expect(error.message).toBe('Invalid export format');
      expect(error.name).toBe('DeepcrawlInvalidExportFormatError');
      expect(error.code).toBe('INVALID_EXPORT_FORMAT');
      expect(error.status).toBe(400);
      expect(error.id).toBe('log-123');
      expect(error.format).toBe('invalid');
      expect(error.path).toBe('read-getMarkdown');
      expect(error).toBeInstanceOf(DeepcrawlError);
    });
  });

  describe('Error inheritance chain', () => {
    it('should maintain proper prototype chain', () => {
      const errors = [
        new DeepcrawlAuthError('auth'),
        new DeepcrawlNetworkError('network'),
        new DeepcrawlValidationError('validation'),
        new DeepcrawlNotFoundError('not found'),
        new DeepcrawlServerError('server'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(DeepcrawlError);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Type guard methods', () => {
    it('should have static type guard methods', () => {
      const authError = new DeepcrawlAuthError('test');
      expect(DeepcrawlError.isAuthError(authError)).toBe(true);
      expect(DeepcrawlError.isValidationError(authError)).toBe(false);
    });

    it('should have instance type guard methods', () => {
      const authError = new DeepcrawlAuthError('test');
      expect(authError.isAuth()).toBe(true);
      expect(authError.isValidation()).toBe(false);
    });
  });
});
