import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import { isValidGithubToken, isValidOpenAIKey, isValidAPIKey } from './workflowUtils';

vi.mock('fs', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    default: { ...actual, readFileSync: vi.fn() },
    readFileSync: vi.fn(),
  };
});

describe('getConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse valid config JSON', async () => {
    const validConfig = JSON.stringify({
      ALFRED_WORKFLOW_BUNDLEID: 'bundleid',
      ALFRED_WORKFLOW_NAME: 'name',
      ALFRED_WORKFLOW_DESCRIPTION: 'desc',
      ALFRED_WORKFLOW_UID: 'uid01',
      ALFRED_WORKFLOW_DATA: 'data',
      ALFRED_KEY_SEQUENCE: 'seq',
      SERVER_PORT: 1234,
      HOST: 'localhost',
      REPO_NAME: 'repo',
      REPO_OWNER: 'owner',
      WORKFLOW_PATH: 'path',
    });
    vi.mocked(fs.readFileSync).mockReturnValue(validConfig);
    const { getConfig } = await import('./workflowUtils');
    expect(getConfig()).toHaveProperty('REPO_NAME', 'repo');
  });

  it('should throw if file not found', async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const { getConfig } = await import('./workflowUtils');
    expect(() => getConfig()).toThrow('Failed to load configuration.');
  });

  it('should throw if invalid JSON', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue('not-json');
    const { getConfig } = await import('./workflowUtils');
    expect(() => getConfig()).toThrow('Failed to load configuration.');
  });

  it('should throw if missing required fields', async () => {
    const invalidConfig = JSON.stringify({ REPO_NAME: 'repo' });
    vi.mocked(fs.readFileSync).mockReturnValue(invalidConfig);
    const { getConfig } = await import('./workflowUtils');
    expect(() => getConfig()).toThrow();
  });
});

describe('getConfigPath', () => {
  it('should return the correct config path', async () => {
    const { getConfigPath } = await import('./workflowUtils');
    expect(getConfigPath()).toContain('config.json');
  });
});

describe('getCLIParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse CLI arguments', async () => {
    const argv = ['node', 'cli.js', '--action', 'home', '--argument', 'foo'];
    const originalArgv = process.argv;
    process.argv = argv;
    const { getCLIParams } = await import('./workflowUtils');
    const params = getCLIParams();
    expect(params.action).toBe('home');
    expect(params.argument).toBe('foo');
    process.argv = originalArgv;
  });
});
describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have default configuration values', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        ALFRED_WORKFLOW_BUNDLEID: 'bundleid',
        ALFRED_WORKFLOW_NAME: 'name',
        ALFRED_WORKFLOW_DESCRIPTION: 'desc',
        ALFRED_WORKFLOW_UID: 'uid01',
        ALFRED_WORKFLOW_DATA: 'data',
        ALFRED_KEY_SEQUENCE: 'seq',
        SERVER_PORT: 1234,
        HOST: 'localhost',
        REPO_NAME: 'repo',
        REPO_OWNER: 'owner',
        WORKFLOW_PATH: 'path',
      }),
    );
    const { getConfig } = await import('./workflowUtils');
    const config = getConfig();
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
