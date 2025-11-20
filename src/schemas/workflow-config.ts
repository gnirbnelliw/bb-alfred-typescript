import { z } from 'zod';

export const workflowVariableSchema = z.object({
  name: z.string().min(2),
  value: z.string().optional(),
  required: z.boolean().default(false),
  helpText: z.string().optional(),
});

export type WorkflowVariable = z.infer<typeof workflowVariableSchema>;

export const workflowConfigSchema = z.object({
  alfred_workflow_bundleid: z.string().min(5),
  port: z.literal(9393).default(9393),
  host: z.literal('127.0.0.1').default('127.0.0.1'),
  persistentDataPath: z
    .string()
    .min(1)
    .transform((path) => (path.endsWith('/') ? path : `${path}/`)),
  creator: z.string().min(2).default('Ben Willenbring'),
  variables: z.array(workflowVariableSchema).default([]),
});

// Create Schema for Alfred
export const alfredWorkflowSchema = z
  .object({
    alfred_workflow_bundleid: z.string().min(5),
    port: z.number().min(1024).max(49151).default(9393),
    host: z.literal('127.0.0.1').default('127.0.0.1'),
    persistentDataPath: z
      .string()
      .min(1)
      .transform((path) => (path.endsWith('/') ? path : `${path}/`)),
    creator: z.string().min(2).default('Ben Willenbring'),
    variables: z.array(workflowVariableSchema).default([]),
  })
  .describe('Schema for Alfred Workflow Configuration');

export const getDefaultWorkflowConfig = (): z.infer<typeof workflowConfigSchema> => {
  return workflowConfigSchema.parse({
    alfred_workflow_bundleid: 'com.ben-willenbring.ts',
    persistentDataPath: './data/',
    variables: [] as z.infer<typeof workflowVariableSchema>[],
  });
};
export type WorkflowConfig = z.infer<typeof workflowConfigSchema>;
