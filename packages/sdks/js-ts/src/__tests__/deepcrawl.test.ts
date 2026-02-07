import { describe, expect, it } from 'vitest';
import { DeepcrawlAuthError } from '../_types';
import { DeepcrawlApp } from '../deepcrawl';

describe('DeepcrawlApp', () => {
  describe('constructor', () => {
    it('should throw error when API key and headers are missing', () => {
      expect(() => new DeepcrawlApp({ apiKey: '' })).toThrow(
        DeepcrawlAuthError,
      );
      expect(() => new DeepcrawlApp({ apiKey: '' })).toThrow(
        '[DEEPCRAWL_AUTH] Please provide a valid API key',
      );
    });

    it('should create instance with valid API key', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-api-key' });
      expect(app).toBeDefined();
      expect(app.client).toBeDefined();
    });

    it('should use default base URL when not provided', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app).toBeDefined();
    });

    it('should accept custom base URL', () => {
      const app = new DeepcrawlApp({
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
      });
      expect(app).toBeDefined();
    });

    it('should handle baseUrl with protocol', () => {
      const app = new DeepcrawlApp({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });
      expect(app).toBeDefined();
    });

    it('should accept session authentication via headers', () => {
      const app = new DeepcrawlApp({
        headers: {
          cookie: 'session=abc123',
        },
      });
      expect(app).toBeDefined();
    });
  });

  describe('client structure', () => {
    it('should have read router', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.client).toBeDefined();
      expect(app.client.read).toBeDefined();
      expect(typeof app.client.read.getMarkdown).toBe('function');
      expect(typeof app.client.read.readUrl).toBe('function');
    });

    it('should have links router', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.client.links).toBeDefined();
      expect(typeof app.client.links.extractLinks).toBe('function');
    });

    it('should have logs router', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.client.logs).toBeDefined();
      expect(typeof app.client.logs.listLogs).toBe('function');
      expect(typeof app.client.logs.getOne).toBe('function');
      expect(typeof app.client.logs.exportResponse).toBe('function');
    });
  });

  describe('method availability', () => {
    it('should have getMarkdown method', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.getMarkdown).toBeDefined();
      expect(typeof app.getMarkdown).toBe('function');
    });

    it('should have readUrl method', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.readUrl).toBeDefined();
      expect(typeof app.readUrl).toBe('function');
    });

    it('should have extractLinks method', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.extractLinks).toBeDefined();
      expect(typeof app.extractLinks).toBe('function');
    });

    it('should have listLogs method', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.listLogs).toBeDefined();
      expect(typeof app.listLogs).toBe('function');
    });

    it('should have getOneLog method', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.getOneLog).toBeDefined();
      expect(typeof app.getOneLog).toBe('function');
    });

    it('should have exportResponse method', () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });
      expect(app.exportResponse).toBeDefined();
      expect(typeof app.exportResponse).toBe('function');
    });
  });

  describe('error handling', () => {
    type FakeOrpcError = {
      code: string;
      status: number;
      message: string;
    };

    type FakeSafeClient = {
      read: {
        getMarkdown: () => Promise<[FakeOrpcError, null]>;
      };
    };

    type DeepcrawlAppWithSafeClient = DeepcrawlApp & {
      safeClient: FakeSafeClient;
    };

    it('should map UNAUTHORIZED ORPC errors to DeepcrawlAuthError', async () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });

      // Override the internal safe client to simulate oRPC errors without network calls.
      (app as unknown as DeepcrawlAppWithSafeClient).safeClient = {
        read: {
          getMarkdown: async () => [
            {
              code: 'UNAUTHORIZED',
              status: 401,
              message: 'Authentication failed',
            },
            null,
          ],
        },
      };

      try {
        await app.getMarkdown('https://example.com');
        throw new Error('Expected getMarkdown() to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(DeepcrawlAuthError);
        expect((error as DeepcrawlAuthError).code).toBe('UNAUTHORIZED');
        expect((error as DeepcrawlAuthError).status).toBe(401);
        expect((error as DeepcrawlAuthError).message).toBe(
          'Authentication failed',
        );
      }
    });

    it('should map legacy UNAUTHORIZED: ORPC errors to DeepcrawlAuthError', async () => {
      const app = new DeepcrawlApp({ apiKey: 'test-key' });

      // Backward-compat with a previously incorrect server error code.
      (app as unknown as DeepcrawlAppWithSafeClient).safeClient = {
        read: {
          getMarkdown: async () => [
            {
              code: 'UNAUTHORIZED:',
              status: 401,
              message: 'Authentication failed',
            },
            null,
          ],
        },
      };

      try {
        await app.getMarkdown('https://example.com');
        throw new Error('Expected getMarkdown() to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(DeepcrawlAuthError);
        expect((error as DeepcrawlAuthError).code).toBe('UNAUTHORIZED');
        expect((error as DeepcrawlAuthError).status).toBe(401);
        expect((error as DeepcrawlAuthError).message).toBe(
          'Authentication failed',
        );
      }
    });
  });
});
