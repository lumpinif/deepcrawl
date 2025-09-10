// import { describe, it, expect } from 'vitest';
// import { DeepcrawlApp } from '../deepcrawl';
// import type { DeepcrawlClient, DeepcrawlContract } from '../index';

// describe('Integration Tests', () => {
//   describe('TypeScript types', () => {
//     it('should export correct types', () => {
//       // This test verifies that types are exported correctly
//       const app = new DeepcrawlApp({ apiKey: 'test' });

//       // Verify client is properly typed
//       expect(app.client).toBeDefined();
//       expect(app.client.read).toBeDefined();
//       expect(app.client.links).toBeDefined();
//     });

//     it('should work with custom client type', () => {
//       // This demonstrates that advanced users can use the exported types
//       const app = new DeepcrawlApp({ apiKey: 'test' });
//       const client: DeepcrawlClient = app.client;

//       expect(client).toBeDefined();
//     });
//   });

//   describe('Node.js environment', () => {
//     it('should work in Node.js environment', () => {
//       // Verify that server-side restriction is removed
//       const app = new DeepcrawlApp({ apiKey: 'test' });
//       expect(app).toBeDefined();
//     });

//     it('should accept custom fetch for older Node versions', () => {
//       // Mock a custom fetch implementation
//       const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
//         return new Response('test', { status: 200 });
//       };

//       const app = new DeepcrawlApp({
//         apiKey: 'test',
//         fetch: customFetch as any,
//       });

//       expect(app).toBeDefined();
//     });
//   });

//   describe('Configuration', () => {
//     it('should handle various configuration options', () => {
//       const app = new DeepcrawlApp({
//         apiKey: 'test-key',
//         baseUrl: 'https://custom.api.com',
//         headers: {
//           'X-Custom': 'value',
//           'X-Request-ID': '12345',
//         },
//         timeout: 30000,
//       });

//       expect(app).toBeDefined();
//     });
//   });

//   describe('Error handling patterns', () => {
//     it('should provide clear error types', async () => {
//       const app = new DeepcrawlApp({ apiKey: 'test' });

//       // The actual error handling is tested in deepcrawl.test.ts
//       // This just verifies the pattern works
//       try {
//         await app.getMarkdown('https://example.com');
//       } catch (error) {
//         // Users can check error types
//         if (error instanceof Error) {
//           expect(['DeepcrawlError', 'DeepcrawlNetworkError', 'DeepcrawlAuthError'])
//             .toContain(error.name);
//         }
//       }
//     });
//   });
// });
