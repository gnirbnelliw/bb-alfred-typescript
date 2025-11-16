import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { getDirName } from '../utils/nodeUtils';

const __dirname = getDirName();

// Define folder path as: img/icons/
export const iconFolderPath = path.join(__dirname, '..', 'dist', 'img', 'icons');

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
    // Normalize the path
    const fileName = path.basename(iconPath);
    const normalizedPath = `dist/img/icons/${fileName}`;
    return normalizedPath;
  } catch (e) {
    console.error('⚠️ Error normalizing icon path:', iconPath);
    return defaultAppIconPath();
  }
};

// Zod schema for an Alfred Menu Icon
export const alfredIconSchema = z.object({
  path: z.string().transform((val) => {
    // if the icon exists, use it. Otherwise, use default app icon.
    return iconFileExists(val) ? val : defaultAppIconPath();
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

