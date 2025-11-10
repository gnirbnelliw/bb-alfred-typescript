import { z } from 'zod';

// Never allow non-https urls
export const urlSchema = z.url().refine((url) => url.startsWith('https'), {
  message: 'Only HTTPS URLs are allowed',
});

// Typescript type inferred from the schema
export type URLString = z.infer<typeof urlSchema>;
