// import { afterAll, afterEach, beforeAll } from 'vitest';
// import { setupServer } from 'msw/node';
// import { http, HttpResponse } from 'msw';

// // Mock responses
// export const mockMarkdownResponse = '# Example Markdown\n\nThis is a test response.';
// export const mockReadResponse = {
//   success: true,
//   targetUrl: 'https://example.com',
//   cached: false,
//   timestamp: new Date().toISOString(),
//   markdown: mockMarkdownResponse,
//   cleanedHtml: '<h1>Example HTML</h1>',
//   metadata: {
//     title: 'Example Page',
//     description: 'Test description',
//     language: 'en',
//     canonical: 'https://example.com',
//     robots: 'index,follow',
//   },
// };
// export const mockLinksResponse = {
//   success: true,
//   targetUrl: 'https://example.com',
//   timestamp: new Date().toISOString(),
//   cached: false,
//   extractedLinks: {
//     internal: [
//       'https://example.com/page1',
//       'https://example.com/page2',
//     ],
//     external: [],
//     media: {
//       images: [],
//       videos: [],
//       documents: [],
//     },
//   },
// };

// // Setup MSW server
// export const server = setupServer(
//   // oRPC uses POST for all calls and wraps responses in { json: ... }
//   http.post('*/rpc/read/getMarkdown', () => {
//     // For getMarkdown, the contract expects a Blob
//     // In oRPC, Blobs are serialized as objects
//     const blobData = {
//       type: 'text/markdown',
//       size: mockMarkdownResponse.length,
//       text: mockMarkdownResponse,
//     };
//     return HttpResponse.json({ json: blobData });
//   }),

//   http.post('*/rpc/read/readWebsite', () => {
//     return HttpResponse.json({ json: mockReadResponse });
//   }),

//   http.post('*/rpc/links/getLinks', () => {
//     return HttpResponse.json({ json: mockLinksResponse });
//   }),

//   http.post('*/rpc/links/extractLinks', () => {
//     return HttpResponse.json({ json: mockLinksResponse });
//   }),
// );

// // Start server before all tests
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// // Reset handlers after each test
// afterEach(() => server.resetHandlers());

// // Clean up after all tests
// afterAll(() => server.close());
