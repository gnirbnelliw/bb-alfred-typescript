import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// ES module-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define folder path as: img/icons/
export const iconFolderPath = path.join(__dirname, '..', '..', 'img', 'icons');

/**
 * Helper function to check if icon file exists.
 * @param iconPath { string } Path to icon file
 * @returns
 */
export const iconFileExists = (iconPath: string): boolean => {
  // Expect a non-absolute path always
  const fullPath = path.isAbsolute(iconPath) ? iconPath : path.join(iconFolderPath, iconPath);
  return fs.existsSync(fullPath);
};

// Zod schema for an Alfred Menu Icon
export const alfredIconSchema = z.object({
  type: z.enum(['fileicon', 'filetype']).optional(),
  path: z.string().refine((p) => iconFileExists(p), {
    message: 'Icon file does not exist at the specified path',
  }),
});

// Typescript type inferred from the schema
export type AlfredIcon = z.infer<typeof alfredIconSchema>;
