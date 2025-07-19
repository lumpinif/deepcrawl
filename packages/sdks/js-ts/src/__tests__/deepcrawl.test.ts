// import { describe, it, expect, beforeEach, vi } from 'vitest';
// import { http, HttpResponse } from 'msw';
// import { DeepcrawlApp } from '../deepcrawl';
// import { DeepcrawlAuthError, DeepcrawlError, DeepcrawlNetworkError } from '../types';
// import { server, mockMarkdownResponse, mockReadResponse, mockLinksResponse } from './setup';

// describe('DeepcrawlApp', () => {
//   let app: DeepcrawlApp;

//   beforeEach(() => {
//     app = new DeepcrawlApp({
//       apiKey: 'test-api-key',
//       baseUrl: 'https://api.test.com',
//     });
//   });

//   describe('constructor', () => {
//     it('should throw error when API key is missing', () => {
//       expect(() => new DeepcrawlApp({ apiKey: '' })).toThrow(DeepcrawlAuthError);
//       expect(() => new DeepcrawlApp({ apiKey: '' })).toThrow('API key is required');
//     });

//     it('should use default base URL when not provided', () => {
//       const appWithDefaults = new DeepcrawlApp({ apiKey: 'test-key' });
//       expect(appWithDefaults).toBeDefined();
//     });

//     it('should accept custom headers', () => {
//       const appWithHeaders = new DeepcrawlApp({
//         apiKey: 'test-key',
//         headers: {
//           'X-Custom-Header': 'value',
//         },
//       });
//       expect(appWithHeaders).toBeDefined();
//     });

//     it('should accept custom fetch implementation', () => {
//       const customFetch = vi.fn();
//       const appWithCustomFetch = new DeepcrawlApp({
//         apiKey: 'test-key',
//         fetch: customFetch as unknown as typeof fetch,
//       });
//       expect(appWithCustomFetch).toBeDefined();
//     });
//   });

//   describe('getMarkdown', () => {
//     it('should fetch markdown successfully', async () => {
//       const result = await app.getMarkdown('https://example.com');
//       expect(result).toBe(mockMarkdownResponse);
//     });

//     it('should handle blob responses', async () => {
//       server.use(
//         http.post('*/rpc/read/getMarkdown', () => {
//           return HttpResponse.blob(new Blob([mockMarkdownResponse], { type: 'text/plain' }));
//         })
//       );

//       const result = await app.getMarkdown('https://example.com');
//       expect(result).toBe(mockMarkdownResponse);
//     });

//     it('should handle network errors', async () => {
//       server.use(
//         http.post('*/rpc/read/getMarkdown', () => {
//           return HttpResponse.error();
//         })
//       );

//       await expect(app.getMarkdown('https://example.com')).rejects.toThrow(DeepcrawlNetworkError);
//     });

//     it('should handle API errors', async () => {
//       server.use(
//         http.post('*/rpc/read/getMarkdown', () => {
//           return HttpResponse.json(
//             { error: { message: 'Invalid URL' } },
//             { status: 400 }
//           );
//         })
//       );

//       await expect(app.getMarkdown('https://example.com')).rejects.toThrow(DeepcrawlError);
//     });
//   });

//   describe('readUrl', () => {
//     it('should read URL successfully', async () => {
//       const result = await app.readUrl('https://example.com');
//       expect(result).toEqual(mockReadResponse);
//     });

//     it('should accept read options', async () => {
//       const result = await app.readUrl('https://example.com', {
//         cleanedHtml: true,
//         markdown: true,
//       });
//       expect(result).toEqual(mockReadResponse);
//     });

//     it('should handle errors', async () => {
//       server.use(
//         http.post('*/rpc/read/readWebsite', () => {
//           return HttpResponse.json(
//             { error: { message: 'Failed to read' } },
//             { status: 500 }
//           );
//         })
//       );

//       await expect(app.readUrl('https://example.com')).rejects.toThrow(DeepcrawlError);
//     });
//   });

//   describe('getLinks', () => {
//     it('should get links successfully', async () => {
//       const result = await app.getLinks('https://example.com');
//       expect(result).toEqual(mockLinksResponse);
//     });

//     it('should handle errors', async () => {
//       server.use(
//         http.post('*/rpc/links/getLinks', () => {
//           return HttpResponse.json(
//             { error: { message: 'Failed to get links' } },
//             { status: 500 }
//           );
//         })
//       );

//       await expect(app.getLinks('https://example.com')).rejects.toThrow(DeepcrawlError);
//     });
//   });

//   describe('extractLinks', () => {
//     it('should extract links successfully', async () => {
//       const result = await app.extractLinks('https://example.com');
//       expect(result).toEqual(mockLinksResponse);
//     });

//     it('should accept link options', async () => {
//       const result = await app.extractLinks('https://example.com', {
//         limit: 10,
//         maxDepth: 2,
//       });
//       expect(result).toEqual(mockLinksResponse);
//     });

//     it('should handle errors', async () => {
//       server.use(
//         http.post('*/rpc/links/extractLinks', () => {
//           return HttpResponse.json(
//             { error: { message: 'Failed to extract links' } },
//             { status: 500 }
//           );
//         })
//       );

//       await expect(app.extractLinks('https://example.com')).rejects.toThrow(DeepcrawlError);
//     });
//   });

//   describe('retry functionality', () => {
//     it('should retry failed requests', async () => {
//       let attemptCount = 0;
//       server.use(
//         http.post('*/rpc/read/getMarkdown', () => {
//           attemptCount++;
//           if (attemptCount < 3) {
//             return HttpResponse.error();
//           }
//           return HttpResponse.text(mockMarkdownResponse);
//         })
//       );

//       const result = await app.getMarkdown('https://example.com');
//       expect(result).toBe(mockMarkdownResponse);
//       expect(attemptCount).toBe(3);
//     });

//     it('should fail after max retries', async () => {
//       server.use(
//         http.post('*/rpc/read/getMarkdown', () => {
//           return HttpResponse.error();
//         })
//       );

//       await expect(app.getMarkdown('https://example.com')).rejects.toThrow(DeepcrawlNetworkError);
//     });
//   });
// });
