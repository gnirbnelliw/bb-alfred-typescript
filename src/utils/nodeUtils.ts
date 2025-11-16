import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Returns the current directory path.
 * Works in both ESM and CommonJS builds.
 */
export const getDirName = (): string => {
  try {
    // Works only in ESM builds
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const __filename = fileURLToPath(import.meta.url);
    return path.dirname(__filename);
  } catch {
    // CommonJS fallback
    return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  }
};
