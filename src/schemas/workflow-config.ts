import { z } from 'zod';
import { required } from 'zod/v4/core/util.cjs';

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

export type WorkflowConfig = z.infer<typeof workflowConfigSchema>;
