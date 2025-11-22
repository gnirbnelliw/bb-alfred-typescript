import { z } from 'zod';
import {
  envSchema,
  customAlfredEnvSchema,
  type CustomEnvSchemaType,
} from '../schemas/environment-schema';
import dotenv from 'dotenv';

dotenv.config();

export const getEnvironmentVariables = (): z.infer<typeof customAlfredEnvSchema> => {
  const parsedEnv = customAlfredEnvSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    console.warn(
      'Warning: Some environment variables are missing or invalid:',
      parsedEnv.error.format(),
    );
  }
  return parsedEnv.success ? parsedEnv.data : customAlfredEnvSchema.parse({}); // Return defaults if parsing fails
};

export function getEnv<K extends keyof CustomEnvSchemaType>(
  key: K,
  defaultValue: string = '',
): string {
  // Parse all of process.env
  const parsedEnv = customAlfredEnvSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    console.warn(
      'Warning: Some environment variables are missing or invalid:',
      parsedEnv.error.format(),
    );
  }
  if (parsedEnv.success && key in parsedEnv.data) {
    const value = parsedEnv.data[key];
    return typeof value === 'number' ? value.toString() : value;
  }
  return defaultValue;
}
