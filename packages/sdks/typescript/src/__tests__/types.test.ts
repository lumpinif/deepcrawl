// import { describe, it, expect } from 'vitest';
// import { DeepcrawlError, DeepcrawlAuthError, DeepcrawlNetworkError } from '../types';

// describe('Error Classes', () => {
//   describe('DeepcrawlError', () => {
//     it('should create error with message', () => {
//       const error = new DeepcrawlError('Test error');
//       expect(error.message).toBe('Test error');
//       expect(error.name).toBe('DeepCrawlError');
//       expect(error).toBeInstanceOf(Error);
//     });

//     it('should include status code and response', () => {
//       const response = { data: 'test' };
//       const error = new DeepcrawlError('Test error', 404, response);
//       expect(error.statusCode).toBe(404);
//       expect(error.response).toEqual(response);
//     });
//   });

//   describe('DeepcrawlAuthError', () => {
//     it('should create auth error with default message', () => {
//       const error = new DeepcrawlAuthError();
//       expect(error.message).toBe('Authentication failed');
//       expect(error.name).toBe('DeepCrawlAuthError');
//       expect(error.statusCode).toBe(401);
//     });

//     it('should create auth error with custom message', () => {
//       const error = new DeepcrawlAuthError('Invalid API key');
//       expect(error.message).toBe('Invalid API key');
//     });

//     it('should be instance of DeepcrawlError', () => {
//       const error = new DeepcrawlAuthError();
//       expect(error).toBeInstanceOf(DeepcrawlError);
//     });
//   });

//   describe('DeepcrawlNetworkError', () => {
//     it('should create network error with default message', () => {
//       const error = new DeepcrawlNetworkError();
//       expect(error.message).toBe('Network error');
//       expect(error.name).toBe('DeepCrawlNetworkError');
//     });

//     it('should create network error with custom message and cause', () => {
//       const cause = new Error('Connection failed');
//       const error = new DeepcrawlNetworkError('Request failed', cause);
//       expect(error.message).toBe('Request failed');
//       expect(error.cause).toBe(cause);
//     });

//     it('should be instance of DeepcrawlError', () => {
//       const error = new DeepcrawlNetworkError();
//       expect(error).toBeInstanceOf(DeepcrawlError);
//     });
//   });
// });
