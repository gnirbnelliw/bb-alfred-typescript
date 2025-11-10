import { z } from 'zod';
import { AlfredIcon, alfredIconSchema } from './alfred-icon';

// Zod schema for Alfred Menu Item.. alfredIconSchema.optional()
export const alfredMenuItemSchema = z.object({
  uid: z.string(),
  type: z.enum(['default', 'file', 'file:skipcheck']).optional(),
  title: z.string().min(2),
  subtitle: z.string().optional(),
  arg: z.string().min(2),
  autocomplete: z.string(),
  match: z.string().optional(),
  icon: alfredIconSchema.optional(),
});

// Typescript type inferred from the schema
export type AlfredMenuItem = z.infer<typeof alfredMenuItemSchema>;

// Zod Schema for Alfred variables (arbitrary string keys and string values)
export const alfredVariableSchema = z.record(z.string(), z.string());

// Zod schema for items array with uid uniqueness validation
export const alfredMenuItemsSchema = z
  .object({
    items: z.array(alfredMenuItemSchema),
    variables: alfredVariableSchema.optional(),
  })
  .refine(
    (data) => {
      const uids = data.items.map((item) => item.uid);
      const uniqueUids = new Set(uids);
      return uids.length === uniqueUids.size;
    },
    {
      message: 'All menu item UIDs must be unique',
      path: ['items'],
    },
  );

// Typescript type inferred from the items schema
export type AlfredMenuItems = z.infer<typeof alfredMenuItemsSchema>;
