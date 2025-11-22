import { z } from 'zod';

/**
 * Schema for Alfred environment variables.
 */
export const envSchema = z.object({
  alfred_workflow_bundleid: z.string().default(process.env.alfred_workflow_bundleid || ''),
  alfred_theme: z.string().default(''),
  alfred_theme_subtext: z.string().default(''),
  alfred_version_build: z.string().default(''),
  alfred_workflow_version: z.string().default(''),
  alfred_workflow_name: z.string().default(''),
  alfred_workflow_description: z.string().default(''),
  alfred_workflow_uid: z.string().default(''),
  alfred_theme_window_width: z.number().default(700),
  alfred_workflow_cache: z.string().default(''),
  alfred_workflow_data: z.string().default(''),
  alfred_theme_selection_background: z.string().default(''),
  alfred_debug: z.string().default(''),
  alfred_preferences: z.string().default(''),
  alfred_theme_background: z.string().default(''),
  alfred_preferences_localhash: z.string().default(''),
});

export type EnvSchemaType = z.infer<typeof envSchema>;

/**
 * Extended schema for custom environment variables used in this Alfred workflow.
 */
export const customAlfredEnvSchema = envSchema.extend({
  alfred_keyword: z
    .string()
    .min(2)
    .default(process.env.alfred_keyword || ''),
  SERVER_PORT: z.number().default(9393),
  HOST: z.string().default('127.0.0.1'),
  GITHUB_TOKEN: z
    .string()
    .min(40)
    .default(process.env.GITHUB_TOKEN || ''),
});

export type CustomEnvSchemaType = z.infer<typeof customAlfredEnvSchema>;
