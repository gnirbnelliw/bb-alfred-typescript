import fs from 'fs';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type AlfredIcon, alfredIconSchema, iconFileExists } from './alfred-icon';
import { defaultAppIcon, defaultAppIconPath, normalizedIconPath } from './alfred-icon';

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
    // Set filePath
    const filePath = '/absolute/path/to/icon.png';
    // We need to mock path for this test
    vi.mock('path');
    vi.mocked(path.basename).mockReturnValue('icon.png');
    vi.mocked(path.join).mockReturnValue(filePath);
    const result = iconFileExists('/absolute/path/to/icon.png');
    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(filePath);
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

describe('normalizedIconPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a default icon path when given an invalid path', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = normalizedIconPath('invalid-icon.png');
    expect(result).toBe(defaultAppIconPath());
  });

  it('should return normalized path when icon exists', async () => {
    // Set up filePath
    const filePath = 'test-icon.png';
    // Mock path functions
    vi.mock('path');
    vi.mocked(path.basename).mockReturnValue(filePath);
    vi.mocked(path.join).mockReturnValue(`mocked-absolute-path/img/icons/${filePath}`);
    const result = normalizedIconPath(filePath);
    expect(result).toContain(filePath);
  });

  it('should return default icon path when icon does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const { normalizedIconPath, defaultAppIconPath } = await import('./alfred-icon');
    const result = normalizedIconPath('nonexistent.png');
    expect(result).toBe(defaultAppIconPath());
  });
});

describe('defaultAppIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return default app icon', async () => {
    const { defaultAppIcon } = await import('./alfred-icon');
    const result = defaultAppIcon();
    expect(result).toHaveProperty('type', 'fileicon');
    expect(result).toHaveProperty('path');
    expect(result.path).toContain('alfred.png');
  });
});
