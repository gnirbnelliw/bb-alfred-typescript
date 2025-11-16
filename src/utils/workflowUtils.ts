import fs from 'fs';
import { z } from 'zod';
import {
  type WorkflowVariable,
  workflowConfigSchema,
  type workflowVariableSchema,
} from '../schemas/workflow-config';

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

const rawVariablesSchema = z.object({
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
// Code goes inside anonymous async function, and is executed immediately
(async () => {
  // Stuff here.
})();
