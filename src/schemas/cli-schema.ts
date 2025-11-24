import { z } from 'zod';

// Create schema for possible cli actions
export const cliActionSchema = z.enum([
  'notify',
  'home',
  'server-status',
  'terminal-command',
  'start-server',
  'kill-server',
  'restart-server',
  'get-config',
  'save-config',
]);

export type cliActions = z.infer<typeof cliActionSchema>;

export const cliSchema = z.object({
  action: cliActionSchema.default('server-status'),
  argument: z.string().max(155).default(''),
});
