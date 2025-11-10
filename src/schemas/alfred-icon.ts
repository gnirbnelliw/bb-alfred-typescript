import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Define folder path as: img/icons/
export const iconFolderPath = path.join(__dirname, '..', 'dist', 'img', 'icons');
// console.log(`🔥 iconFolderPath: ${iconFolderPath}`);

/**
 * Checks if file exists at its normalized path (dist).
 * @param iconPath { string } Path to icon file
 * @returns
 */
export const iconFileExists = (iconPath: string): boolean => {
  const fullPath = normalizedIconPath(iconPath);
  return fs.existsSync(fullPath);
};

/**
 * Returns a normalized path accounting for the dist folder structure.
 * @param iconPath { string }
 * @returns
 */
export const normalizedIconPath = (iconPath: string): string => {
  try {
    // IF the iconFileExists, then return
    const fileName = path.basename(iconPath);
    const normalizedPath = `dist/img/icons/${fileName}`;
    const exists = fs.existsSync(normalizedPath);
    return exists ? normalizedPath : defaultAppIconPath();
    // return exists ? path.join(iconFolderPath, fileName) : defaultAppIcon().path;
  } catch (e) {
    console.error('⚠️ Warning: Error normalizing icon path:', e);
    return defaultAppIconPath();
  }
};

// Zod schema for an Alfred Menu Icon
export const alfredIconSchema = z.object({
  path: z.string().transform((val) => {
    // if the icon exists, use it
    if (iconFileExists(val)) return val;

    // Otherwise
    return defaultAppIconPath();
  }),
});

// Typescript type inferred from the schema
export type AlfredIcon = z.infer<typeof alfredIconSchema>;

/**
 * The default path to alfred icon.
 * @returns { string }
 */
export const defaultAppIconPath = (): string => 'dist/img/icons/alfred.png';

export const defaultAppIcon = (): AlfredIcon => {
  return alfredIconSchema.parse({
    type: 'fileicon',
    path: defaultAppIconPath(),
  });
};

