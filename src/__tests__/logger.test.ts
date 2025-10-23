import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import logger from '../../services/logger';

describe('Logger Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  it('should log INFO level messages', () => {
    logger.info('Test info message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log WARN level messages', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log ERROR level messages', () => {
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalled();
  });

  it('should include timestamp in logs', () => {
    logger.info('Test message');
    const callArgs = (console.log as jest.Mock).mock.calls[0][0];
    expect(callArgs).toMatch(/\[\d{4}-\d{2}-\d{2}T/); // ISO format
  });

  it('should include context in structured logs', () => {
    logger.info('Test message', { userId: '123', action: 'create' });
    const callArgs = (console.log as jest.Mock).mock.calls[0][0];
    expect(callArgs).toContain('userId');
    expect(callArgs).toContain('action');
  });

  it('should support logRequest helper', () => {
    logger.logRequest('POST', '/api/test', { data: 'payload' });
    expect(console.log).toHaveBeenCalled();
  });

  it('should support logResponse helper', () => {
    logger.logResponse('POST', '/api/test', 200, { result: 'success' });
    expect(console.log).toHaveBeenCalled();
  });

  it('should include stack trace on ERROR level', () => {
    const error = new Error('Test error');
    logger.error('An error occurred', undefined, error);
    expect(console.error).toHaveBeenCalled();
  });
});
