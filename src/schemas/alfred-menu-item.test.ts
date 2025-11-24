import { describe, expect, it, beforeEach, vi } from 'vitest';
import fs from 'fs';
import { alfredMenuItemSchema, alfredMenuItemsSchema } from './alfred-menu-item';

vi.mock('fs', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    default: { ...actual, existsSync: vi.fn(() => true) },
    existsSync: vi.fn(() => true),
  };
});

vi.mock('path', async () => {
  const actual = await vi.importActual<any>('path');
  return {
    ...actual,
    basename: vi.fn((p) => p),
    join: vi.fn((...args) => args.join('/')),
  };
});

describe('iconFileExists()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  it('should return true with a mocked file that exists', async () => {
    const { iconFileExists } = await import('./alfred-icon');
    expect(iconFileExists('good-icon.png')).toBe(true);
  });

  it('should return false when fs.existsSync returns false', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    const { iconFileExists } = await import('./alfred-icon');
    expect(iconFileExists('nonexistent-icon.png')).toBe(false);
  });
});

describe('alfredMenuItemSchema', () => {
  it('should enforce uniqueness in uid field', () => {
    // Implement
    const invalidItems = {
      items: [
        {
          uid: 'uid-1',
          title: 'Item 1',
          arg: 'arg-1',
          autocomplete: 'autocomplete-1',
        },
        {
          uid: 'uid-1', // Invalid: duplicate uid
          title: 'Item 2',
          arg: 'arg-2',
          autocomplete: 'autocomplete-2',
        },
      ],
    };
    const result = alfredMenuItemsSchema.safeParse(invalidItems);
    expect(result.success).toBe(false);
  });

  it('should validate a valid menu item with all required fields', () => {
    const validItem = {
      uid: 'test-uid',
      title: 'Test Title',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('should validate a menu item with all optional fields', () => {
    const validItem = {
      uid: 'test-uid',
      type: 'default' as const,
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
      icon: {
        type: 'fileicon' as const,
        path: '/path/to/icon',
      },
    };

    const result = alfredMenuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('should reject a menu item with title less than 2 characters', () => {
    const invalidItem = {
      uid: 'test-uid',
      title: 'A',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('should reject a menu item with arg of 0 characters', () => {
    const invalidItem = {
      uid: 'test-uid',
      title: 'Test Title',
      arg: '',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('should reject a menu item missing required fields', () => {
    const invalidItem = {
      uid: 'test-uid',
      subtitle: 'Test Title', // Missing title
    };

    const result = alfredMenuItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('should reject a menu item with invalid type enum value', () => {
    const invalidItem = {
      uid: 'test-uid',
      type: 'invalid-type',
      title: 'Test Title',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('should ignore invalid props like icon[type]', () => {
    const invalidItem = {
      uid: 'test-uid',
      title: 'Test Title',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
      icon: {
        type: 'totally irrelvant property',
        path: '/path/to/icon',
      },
    };
    const result = alfredMenuItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(true);
    // Assert that result.data does not have the type property in its icon
    expect(result.data?.icon).not.toHaveProperty('type');
  });

  it('should validate menu item with file type', () => {
    const validItem = {
      uid: 'test-uid',
      type: 'file' as const,
      title: 'Test Title',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('should validate menu item with file:skipcheck type', () => {
    const validItem = {
      uid: 'test-uid',
      type: 'file:skipcheck' as const,
      title: 'Test Title',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('should validate icon with filetype', () => {
    const validItem = {
      uid: 'test-uid',
      title: 'Test Title',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
      icon: {
        type: 'filetype' as const,
        path: '/path/to/icon',
      },
    };

    const result = alfredMenuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });
});

describe('alfredMenuItemsSchema', () => {
  it('should validate an array of valid menu items', () => {
    const validItems = {
      items: [
        {
          uid: 'uid-1',
          title: 'Title 1',
          arg: 'arg-1',
          autocomplete: 'autocomplete-1',
        },
        {
          uid: 'uid-2',
          title: 'Title 2',
          arg: 'arg-2',
          autocomplete: 'autocomplete-2',
        },
      ],
    };

    const result = alfredMenuItemsSchema.safeParse(validItems);
    expect(result.success).toBe(true);
  });

  it('should validate an empty items array', () => {
    const validItems = {
      items: [],
    };

    const result = alfredMenuItemsSchema.safeParse(validItems);
    expect(result.success).toBe(true);
  });

  it('should reject if items is not an array', () => {
    const invalidItems = {
      items: 'not-an-array',
    };

    const result = alfredMenuItemsSchema.safeParse(invalidItems);
    expect(result.success).toBe(false);
  });

  it('should reject if any item in the array is invalid', () => {
    const invalidItems = {
      items: [
        {
          uid: 'uid-1',
          title: 'Title 1',
          arg: 'arg-1',
          autocomplete: 'autocomplete-1',
        },
        {
          uid: 'uid-2',
          title: 'A', // Invalid: less than 2 characters
          arg: 'arg-2',
          autocomplete: 'autocomplete-2',
        },
      ],
    };

    const result = alfredMenuItemsSchema.safeParse(invalidItems);
    expect(result.success).toBe(false);
  });

  it('should reject if items field is missing', () => {
    const invalidItems = {};

    const result = alfredMenuItemsSchema.safeParse(invalidItems);
    expect(result.success).toBe(false);
  });
});
