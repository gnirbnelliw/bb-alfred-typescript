import { beforeEach, describe, expect, it, vi } from 'vitest';

import { config, isValidAPIKey, isValidGithubToken, isValidOpenAIKey } from './workflowUtils';

describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have default configuration values', async () => {
    expect(config).toBeDefined();
    expect(config).toHaveProperty('ALFRED_WORKFLOW_BUNDLEID');
    expect(config).toHaveProperty('ALFRED_WORKFLOW_NAME');
    expect(config).toHaveProperty('ALFRED_WORKFLOW_DESCRIPTION');
    expect(config).toHaveProperty('ALFRED_WORKFLOW_UID');
    expect(config).toHaveProperty('ALFRED_WORKFLOW_DATA');
    expect(config).toHaveProperty('ALFRED_KEY_SEQUENCE');
    expect(config).toHaveProperty('SERVER_PORT');
    expect(config).toHaveProperty('HOST');
    expect(config).toHaveProperty('REPO_NAME');
    expect(config).toHaveProperty('REPO_OWNER');
  });
});

describe('isValidGithubToken', () => {
  const goodValues = [
    'ghp_abcdefghijklmnopqrstuvwxyz1234567890ABCD',
    'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321abcd',
    'ghp_1234567890abcdefghijklmnopqrstuvwxyzABCD',
    'ghp_abcdEFGHijklMNOPqrstUVWXyz01234567899487658946',
  ];

  it.each(goodValues)('should validate good GitHub token: %s', (token) => {
    expect(isValidGithubToken(token)).toBe(true);
  });

  const badValues = [
    'gho_abc',
    'ghp_short',
    'invalidtoken1234567890',
    '',
    'ghp_!@#$%^&*()_+{}|:"<>?`~',
    undefined,
  ];
  it.each(badValues)('should invalidate bad GitHub token: %s', (token) => {
    expect(isValidGithubToken(token)).toBe(false);
  });

  const illegalValues = [null, true, false, -55, [], {}, 0, 1.23];
  it.each(illegalValues)('should throw with value: %s', (token) => {
    expect(() => isValidGithubToken(token as unknown as string)).toThrow();
  });
});

describe('isValidOpenAIKey', () => {
  const goodValues = [
    'sk-abcdefghijklmnopqrstuvwxyz1234567890ABCD',
    'sk-ABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321abcd',
    'sk-1234567890abcdefghijklmnopqrstuvwxyzABCD',
    'sk-abcdEFGHijklMNOPqrstUVWXyz01234567899487658946',
  ];

  it.each(goodValues)('should validate good OpenAI key: %s', (key) => {
    expect(isValidOpenAIKey(key)).toBe(true);
  });

  const badValues = [
    'gemini-abcdefghijklmnopqrstuvwxyz1234567890ABCD',
    '-ABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321abcd',
    'claude-1234567890abcdefghijklmnopqrstuvwxyzABCD',
    'sk-46',
  ];

  it.each(badValues)('should invalidate bad OpenAI key: %s', (key) => {
    expect(isValidOpenAIKey(key)).toBe(false);
  });
});

describe('isValidAPIKey', () => {
  const goodValues = [
    'abcdefghijklmnopqrstuvwxyz123456',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321',
    '1234567890abcdefghijklmnopqrstuvwxyzABCD',
    'abcdEFGHijklMNOPqrstUVWXyz01234567899487658946',
  ];

  it.each(goodValues)('should validate good API key: %s', (key) => {
    expect(isValidAPIKey(key)).toBe(true);
  });

  const badValues = ['shortkey', '123456789', '', '     ', undefined];

  it.each(badValues)('should invalidate bad API key: %s', (key) => {
    expect(isValidAPIKey(key)).toBe(false);
  });
});
