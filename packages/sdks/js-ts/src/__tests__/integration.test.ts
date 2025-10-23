import { describe, expect, it } from 'vitest';
import type { DeepcrawlClient } from '../_types';
import { DeepcrawlApp } from '../deepcrawl';

describe('Integration Tests', () => {
  describe('TypeScript types', () => {
    it('should export correct types', () => {
      const app = new DeepcrawlApp({ apiKey: 'test' });

      // Verify client is properly typed
      expect(app.client).toBeDefined();
      expect(app.client.read).toBeDefined();
      expect(app.client.links).toBeDefined();
    });

    it('should work with custom client type', () => {
      const app = new DeepcrawlApp({ apiKey: 'test' });
      const client: DeepcrawlClient = app.client;

      expect(client).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should handle various configuration options', () => {
      const app = new DeepcrawlApp({
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
        headers: {
          'X-Custom': 'value',
          'X-Request-ID': '12345',
        },
      });

      expect(app).toBeDefined();
    });

    it('should accept custom fetch implementation', () => {
      const customFetch = async (
        input: RequestInfo | URL,
        init?: RequestInit,
      ) => {
        return new Response('test', { status: 200 });
      };

      const app = new DeepcrawlApp({
        apiKey: 'test',
        fetch: customFetch,
      });

      expect(app).toBeDefined();
    });
  });

  describe('Universal runtime support', () => {
    it('should work in Node.js environment', () => {
      const app = new DeepcrawlApp({ apiKey: 'test' });
      expect(app).toBeDefined();
    });

    it('should handle different environments', () => {
      // Verify that the SDK initializes without environment-specific checks
      const app = new DeepcrawlApp({
        apiKey: 'test',
        baseUrl: 'https://api.test.com',
      });

      expect(app).toBeDefined();
      expect(app.client).toBeDefined();
    });
  });

  describe('Headers configuration', () => {
    it('should accept multiple custom headers', () => {
      const app = new DeepcrawlApp({
        apiKey: 'test',
        headers: {
          'X-Custom-1': 'value1',
          'X-Custom-2': 'value2',
          'User-Agent': 'custom-agent/1.0',
        },
      });

      expect(app).toBeDefined();
    });

    it('should work without custom headers', () => {
      const app = new DeepcrawlApp({ apiKey: 'test' });
      expect(app).toBeDefined();
    });
  });
});
