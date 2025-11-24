import { z } from 'zod';

export const alfredConfigSchema = z.object({
  ALFRED_WORKFLOW_BUNDLEID: z.string().min(5),
  ALFRED_WORKFLOW_NAME: z.string().min(2),
  ALFRED_WORKFLOW_DESCRIPTION: z.string().optional(),
  ALFRED_WORKFLOW_UID: z.string().min(5),
  ALFRED_WORKFLOW_DATA: z.string().min(1),
  ALFRED_KEY_SEQUENCE: z.string().min(2),
  WORKFLOW_PATH: z.string().min(1),
  REPO_OWNER: z.string().min(2),
  REPO_NAME: z.string().min(2),
  SERVER_PORT: z
    .union([z.number(), z.string()])
    .default(9393)
    .transform((val) => Number(val)),
  HOST: z.string().optional().default('127.0.0.1'),
  GITHUB_TOKEN: z.string().optional(),
  LINEAR_API_KEY: z.string().optional(),
  OPENAI_KEY: z.string().optional(),
  NOTION_API_KEY: z.string().optional(),
  TESTMO_API_KEY: z.string().optional(),
});
