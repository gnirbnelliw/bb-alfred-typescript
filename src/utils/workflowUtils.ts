import fs from 'fs';
import { exec } from 'node:child_process';
import { z } from 'zod';
import {
  type WorkflowVariable,
  workflowConfigSchema,
  type workflowVariableSchema,
} from '../schemas/workflow-config';

import { Command } from 'commander';
import { cliSchema } from '../schemas/cli-schema';

export const getDefaultWorkflowConfig = (): ReturnType<typeof workflowConfigSchema.parse> => {
  return workflowConfigSchema.parse({
    alfred_workflow_bundleid: 'com.ben-willenbring.ts',
    persistentDataPath: getWorkflowDataDPath(),
    variables: [
      {
        name: 'GITHUB_TOKEN',
        value: '',
        required: true,
        helpText: 'GitHub Personal Access Token with repo access',
      },
      {
        name: 'NOTION_API_KEY',
        value: '',
        required: false,
        helpText: 'Notion Integration Token',
      },
    ] as z.infer<typeof workflowVariableSchema>[],
  });
};

export const getWorkflowDataDPath = (): string => {
  try {
    return process.env.alfred_workflow_data || './';
  } catch (error) {
    console.error('Error getting workflow data path:', error);
    return './';
  }
};

export const config = getDefaultWorkflowConfig();

export const getConfiguredVariables = (): z.infer<typeof workflowVariableSchema>[] => {
  return config.variables;
};

export const getVariable = (name: string): string | undefined => {
  const rawSchema = loadWorkflowVariables();
  if (undefined === rawSchema) {
    return undefined;
  }

  // Find variable by name
  const variable = rawSchema.variables[name as keyof typeof rawSchema.variables];
  return variable ? variable : '';
};

export const rawVariablesSchema = z.object({
  variables: z.object({
    GITHUB_TOKEN: z.string().default(''),
    LINEAR_API_KEY: z.string().default(''),
    OPENAI_KEY: z.string().default(''),
    TESTMO_API_KEY: z.string().default(''),
    NOTION_API_KEY: z.string().default(''),
  }),
});

export const loadWorkflowVariables = (): z.infer<typeof rawVariablesSchema> | undefined => {
  // Attempt to load a json file from config.persistentDataPath/config.json
  // If it does not exist, or if zod parsing fails, return undefined
  const configPath = `${config.persistentDataPath}config.json`;
  try {
    if (fs.existsSync(configPath)) {
      const rawData = fs.readFileSync(configPath, 'utf-8');
      const parsedData = JSON.parse(rawData);
      const rawSchema = rawVariablesSchema.parse(parsedData);
      return rawSchema;
    }
  } catch (error) {
    console.error('Error loading or parsing config file:', error);
    return undefined;
  }
  return undefined;
};

/**
 *
 * @param token { string }
 * @returns { boolean } Whether the provided GitHub token is valid.
 */
export const isValidGithubToken = (token: string | undefined): boolean => {
  // GitHub token length varies, but generally >= 40 chars and start with "ghp_"
  return undefined !== token && token.trim().length >= 40 && token.startsWith('ghp_');
};

/**
 *
 * @param key { string }
 * @returns { boolean } Whether the provided OpenAI API key is valid.
 */
export const isValidOpenAIKey = (key: string | undefined): boolean => {
  // API key length varis, but generally exceed 40 chars and start with "sk-"
  return undefined !== key && key.trim().length >= 40 && key.startsWith('sk-');
};

/**
 *
 * @param key { string }
 * @returns { boolean } Whether the provided API key is valid.
 */
export const isValidAPIKey = (key: string | undefined): boolean => {
  return undefined !== key && key.trim().length >= 20;
};

export const getCLIParams = (): z.infer<typeof cliSchema> => {
  const program = new Command();
  program.option('--action <string>', 'CLI action to perform', 'serverStatus');
  program.option('--argument <string>', 'Argument for the action', '');

  // Allow for help text
  const sep = '-'.repeat(50);
  const codeSamples = [
    'yarn tsx src/cli.ts --action navigate --argument "home"',
    'yarn tsx src/cli.ts --action notify --argument "Hey there"',
    'yarn tsx src/cli.ts --action terminalCommand --argument "ls -la"',
    'yarn tsx src/cli.ts --action serverStatus',
    'yarn tsx src/cli.ts --action getConfig',
    'yarn tsx src/cli.ts --action nodeJSCode --nodeJSCode "console.log(\'Hello from CLI\')"',
  ];
  program.on('--help', () => {
    console.log('');
    console.log(sep);
    console.log('💡 Example call:');
    console.log(codeSamples.map((sample) => `   ${sample}`).join('\n'));
    console.log(sep);
  });

  program.parse(process.argv);
  return cliSchema.parse(program.opts());
};