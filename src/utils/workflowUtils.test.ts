import * as fs from 'node:fs';
import { parse } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  config,
  getConfiguredVariables,
  getDefaultWorkflowConfig,
  getVariable,
  getWorkflowDataDPath,
  isValidAPIKey,
  isValidGithubToken,
  isValidOpenAIKey,
  loadWorkflowVariables,
  rawVariablesSchema,
} from './workflowUtils';

vi.mock('fs');

describe('getWorkflowDataDPath', () => {
  it('should return a string path', () => {
    const path = getWorkflowDataDPath();
    expect(typeof path).toBe('string');
    expect(path.length).toBeGreaterThan(0);
  });
});

describe('getConfiguredVariables', () => {
  it('should return an array of configured variables', () => {
    const vars = getConfiguredVariables();
    expect(Array.isArray(vars)).toBe(true);
  });
});

describe('getDefaultWorkflowConfig', () => {
  it('should return the default workflow configuration', () => {
    const defaultConfig = getDefaultWorkflowConfig();
    expect(defaultConfig).toHaveProperty('persistentDataPath');
    expect(defaultConfig).toHaveProperty('variables');
  });
});

describe('config', () => {
  it('should have default configuration values', () => {
    expect(config).toHaveProperty('persistentDataPath');
    expect(config).toHaveProperty('variables');
  });
});

describe('rawVariablesSchema', () => {
  it('should fail on an empty object', () => {
    const parsed = rawVariablesSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });

  it('should succesfully parse an object with an empty variabes key', () => {
    const obj: object = {
      variables: {
        GITHUB_TOKEN: '',
      },
    };

    const parsed = rawVariablesSchema.safeParse(obj);
    console.log(parsed);
    expect(parsed.success).toBe(true);
    // Despite being empty, it will have all of these properties set to ''
    const defaultProps = [
      'GITHUB_TOKEN',
      'NOTION_API_KEY',
      'LINEAR_API_KEY',
      'OPENAI_KEY',
      'TESTMO_API_KEY',
    ];
    for (const prop of defaultProps) {
      expect(parsed.data?.variables).toHaveProperty(prop);
      expect(parsed.data?.variables[prop as keyof typeof parsed.data.variables]).toBe('');
    }
  });
});

describe('getVariable', () => {
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
  });

  it('should not throw and return undefined for non-existent variable', () => {
    // Mock the return value of loadWorkflowVariables
    vi.fn(loadWorkflowVariables).mockReturnValue({
      variables: {
        GITHUB_TOKEN: 'ghp_some_value_token',
        NOTION_API_KEY: '',
        LINEAR_API_KEY: '',
        OPENAI_KEY: '',
        TESTMO_API_KEY: '',
      },
    });

    // Expect that retrieving a non-existent variable DOES NOT throw
    expect(() => getVariable('NON_EXISTENT_VAR')).not.toThrow();
    expect(getVariable('NON_EXISTENT_VAR')).toBeUndefined();
  });
});

describe('loadWorkflowVariables', () => {
  it('should load and parse workflow variables from config file', () => {
    vi.fn(fs.existsSync).mockReturnValue(true);
    vi.fn(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        variables: {
          GITHUB_TOKEN: 'foo',
          LINEAR_API_KEY: 'bar',
        },
      }),
    );
    const vars = loadWorkflowVariables();
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
