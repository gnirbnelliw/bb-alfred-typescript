import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// ES module-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define folder path as: img/icons/
export const iconFolderPath = path.join(__dirname, '..', '..', 'src', 'img', 'icons');

/**
 * Helper function to check if icon file exists.
 * @param iconPath { string } Path to icon file
 * @returns
 */
export const iconFileExists = (iconPath: string): boolean => {
  // Get the file name of the iconPath
  const fileName = path.basename(iconPath);
  const fullPath = path.join(iconFolderPath, fileName);
  return fs.existsSync(fullPath);
};

export const normalizedIconPath = (iconPath: string): string => {
  try {
    // IF the iconFileExists, then return
    const fileName = path.basename(iconPath);
    const exists = iconFileExists(iconPath);
    return exists ? path.join(iconFolderPath, fileName) : defaultAppIcon().path;
  } catch (e) {
    console.error('⚠️ Warning: Error normalizing icon path:', e);
    return defaultAppIconPath();
  }
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

export const defaultAppIconPath = (): string => 'img/icons/alfred.png';

export const defaultAppIcon = (): AlfredIcon => {
  return alfredIconSchema.parse({
    type: 'fileicon',
    path: defaultAppIconPath(),
  });
};

