import fs from 'fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type AlfredIcon, alfredIconSchema, iconFileExists } from './alfred-icon';

// Mock the fs module
vi.mock('fs');

describe('iconFileExists', () => {
  // By default, mock fs.existsSync to return true
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when icon file exists', () => {
    const result = iconFileExists('test-icon.png');
    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledOnce();
  });

  it('should return false when icon file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = iconFileExists('nonexistent-icon.png');
    expect(result).toBe(false);
    expect(fs.existsSync).toHaveBeenCalledOnce();
  });

  it('should handle absolute paths', () => {
    const result = iconFileExists('/absolute/path/to/icon.png');
    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith('/absolute/path/to/icon.png');
  });

  it('should handle relative paths by joining with iconFolderPath', () => {
    const result = iconFileExists('relative/icon.png');
    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledOnce();
  });
});

describe('alfredIconSchema', () => {
  // By default, mock fs.existsSync to return true.
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should validate an icon with valid path and fileicon type', () => {
    const validIcon = {
      type: 'fileicon' as const,
      path: 'valid-icon.png',
    };

    const result = alfredIconSchema.safeParse(validIcon);
    expect(result.success).toBe(true);
  });

  it('should validate an icon with valid path and filetype type', () => {
    const validIcon = {
      type: 'filetype' as const,
      path: 'valid-icon.svg',
    };

    const result = alfredIconSchema.safeParse(validIcon);
    expect(result.success).toBe(true);
  });

  it('should validate an icon with valid path and no type', () => {
    const validIcon = {
      path: 'valid-icon.png',
    };

    const result = alfredIconSchema.safeParse(validIcon);
    expect(result.success).toBe(true);
  });

  it('should reject an icon with invalid path (file does not exist)', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const invalidIcon = {
      type: 'fileicon' as const,
      path: 'nonexistent-icon.png',
    };

    const result = alfredIconSchema.safeParse(invalidIcon);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Icon file does not exist at the specified path');
    }
  });

  it('should reject an icon with invalid type enum value', () => {
    const invalidIcon = {
      type: 'invalid-type',
      path: 'valid-icon.png',
    };

    const result = alfredIconSchema.safeParse(invalidIcon);
    expect(result.success).toBe(false);
  });

  it('should reject an icon with missing path', () => {
    const invalidIcon = {
      type: 'fileicon' as const,
    };

    const result = alfredIconSchema.safeParse(invalidIcon);
    expect(result.success).toBe(false);
  });

  it('should reject an icon with empty path string', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const invalidIcon = {
      path: '',
    };

    const result = alfredIconSchema.safeParse(invalidIcon);
    expect(result.success).toBe(false);
  });

  it('should validate icon with absolute path that exists', () => {
    const validIcon = {
      type: 'fileicon' as const,
      path: '/absolute/path/to/icon.png',
    };

    const result = alfredIconSchema.safeParse(validIcon);
    expect(result.success).toBe(true);
  });

  it('should reject icon with absolute path that does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const invalidIcon = {
      type: 'fileicon' as const,
      path: '/absolute/path/to/nonexistent.png',
    };

    const result = alfredIconSchema.safeParse(invalidIcon);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Icon file does not exist at the specified path');
    }
  });

  it('should handle various file extensions', () => {
    const extensions = ['icon.png', 'icon.jpg', 'icon.svg', 'icon.ico', 'icon.gif'];

    for (const iconPath of extensions) {
      const validIcon = {
        path: iconPath,
      };

      const result = alfredIconSchema.safeParse(validIcon);
      expect(result.success).toBe(true);
    }
  });
});
