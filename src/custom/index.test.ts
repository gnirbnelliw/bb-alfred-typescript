describe('CustomFunction edge cases', () => {
  it('getMatchingWords: input is string, arg is undefined', () => {
    const custom = new CustomFunction({ inputs: ['hello'] });
    expect(custom.getMatchingWords('hello')).toBe('hello');
  });

  it('getMatchingWords: input is string, arg is provided', () => {
    const custom = new CustomFunction({ inputs: ['hello'] });
    expect(custom.getMatchingWords('hello', 'world')).toBe('hello world');
  });

  it('getMatchingWords: input is object, subtitle and arg missing', () => {
    const obj = { title: 'foo' };
    const custom = new CustomFunction({ inputs: [obj] });
    expect(custom.getMatchingWords(obj)).toBe('foo');
  });

  it('getMatchingWords: input is object, subtitle present, arg missing', () => {
    const obj = { title: 'foo', subtitle: 'bar' };
    const custom = new CustomFunction({ inputs: [obj] });
    expect(custom.getMatchingWords(obj)).toBe('foo bar');
  });

  it('getMatchingWords: input is object, arg present', () => {
    const obj = { title: 'foo', subtitle: 'bar', arg: 'baz' };
    const custom = new CustomFunction({ inputs: [obj] });
    expect(custom.getMatchingWords(obj)).toBe('foo bar baz');
  });

  it('menus: input is string', () => {
    const custom = new CustomFunction({ inputs: ['hello'] });
    const menus = custom.menus((input) => (typeof input === 'string' ? input : input.title));
    expect(menus[0].title).toBe('hello');
    expect(menus[0].autocomplete).toBe('hello');
  });

  it('menus: input is object, missing subtitle/arg', () => {
    const obj = { title: 'foo' };
    const custom = new CustomFunction({ inputs: [obj] });
    const menus = custom.menus(() => 'bar');
    expect(menus[0].title).toEqual('foo');
    for (const word of ['foo', 'bar']) {
      expect(menus[0].autocomplete).toContain(word);
    }
  });

  it('menus: input is object, subtitle and arg present', () => {
    const obj = { title: 'foo', subtitle: 'bar', arg: 'baz' };
    const custom = new CustomFunction({ inputs: [obj] });
    const menus = custom.menus(() => 'baz');
    expect(menus[0].title).toBe('foo');
    for (const word of ['foo', 'bar', 'baz']) {
      expect(menus[0].autocomplete).toContain(word);
    }
  });
});
// Create a vitest test file for the CustomFunction class in src/custom/index.ts
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { alfredMenuItemSchema, alfredMenuItemsSchema } from '../schemas/alfred-menu-item';
import { type customFuncInputItemSchema, customFuncInputsSchema } from './';
import { CustomFunction } from './index';

describe('CustomFunction', () => {
  // Define some sample inputs
  const emojis = customFuncInputsSchema.parse([
    {
      title: 'Emoji: smiling face 😊',
      subtitle: 'Smiling face emoji',
      arg: '😊',
    },
    {
      title: 'Emoji: cry 😢',
      subtitle: 'Crying face emoji',
      arg: '😢',
    },
    {
      title: 'Emoji: laugh 😂',
      subtitle: 'Laughing face emoji',
      arg: '😂',
    },
  ]);

  const customFunction = new CustomFunction({
    inputs: emojis,
    iconPath: 'dist/img/icons/emoji.png',
  });

  const emojiFunction = (input: z.infer<typeof customFuncInputsSchema>[number]): string => {
    if (typeof input === 'string') {
      return input;
    }
    return typeof input === 'string' ? input : input?.arg || '';
  };

  it('should create an instance of CustomFunction', () => {
    expect(customFunction).toBeInstanceOf(CustomFunction);
  });

  it('should generate menus correctly', () => {
    const menus = customFunction.menus(emojiFunction);
    for (const menu of menus) {
      expect(alfredMenuItemSchema.safeParse(menu).success).toBe(true);
    }
  });

  describe('getMatchingWords of inputs', () => {
    // Define test menu items
    const testMenuItems = customFuncInputsSchema.parse([
      {
        title: 'one',
        subtitle: 'two',
        arg: 'three',
      },
    ]);
    // Define the function
    const fn = (arg: z.infer<typeof customFuncInputItemSchema>) => {
      // Handle both string and object inputs
      return typeof arg === 'string' ? arg : (arg.arg ?? 'echo No arg provided');
    };

    // Generate the menus
    const custom = new CustomFunction<string>({
      inputs: testMenuItems,
    });
    const testMenus = custom.menus(fn);
    const menu = testMenus[0];

    // for each testMenus look at its autocomplete using the class method getMatchingWords
    it('autocomplete should be a superset of title, subtitle, and arg', () => {
      const autocomplete = custom.getMatchingWords(menu);
      const expectedValue = 'one two three';
      expect(autocomplete).toBe(expectedValue);
    });
  });

  describe('getMatchingWords', () => {
    // Set up tests
    const testValues = {
      'smiling face face': 'smiling face',
      'cry sad sad': 'cry sad',
      'laugh laugh laugh': 'laugh',
      'cogito, ergo sum': 'cogito, ergo sum',
      ' jeez louse': 'jeez louse',
    };

    it.each(Object.entries(testValues))(
      'should return correct matching words for %s',
      (input, expected) => {
        const result = customFunction.getMatchingWords(input);
        expect(result).toBe(expected);
        console.log(`input: ${input}\nexpected: ${expected}\nactual: ${result}`);
      },
    );
  });
});
describe('alfredMenuItemSchema', () => {
  it('should validate a basic menu item', () => {
    const validItem = {
      uid: 'test-uid',
      title: 'Test Title',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('should validate a menu item with subtitle', () => {
    const validItem = {
      uid: 'test-uid',
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });
});

describe('alfredMenuItemSchema with different types', () => {
  it('should validate menu item with default type', () => {
    const validItem = {
      uid: 'test-uid',
      title: 'Test Title',
      arg: 'test-arg',
      autocomplete: 'test-autocomplete',
    };

    const result = alfredMenuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
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
        path: 'test-icon.png',
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
});

describe('alfredMenuItemsSchema with duplicate UIDs', () => {
  it('should fail validation for duplicate UIDs', () => {
    const invalidItems = {
      items: [
        {
          uid: 'duplicate-uid',
          title: 'Title 1',
          arg: 'arg-1',
          autocomplete: 'autocomplete-1',
        },
        {
          uid: 'duplicate-uid',
          title: 'Title 2',
          arg: 'arg-2',
          autocomplete: 'autocomplete-2',
        },
      ],
    };

    const result = alfredMenuItemsSchema.safeParse(invalidItems);
    expect(result.success).toBe(false);
  });
});

describe('alfredMenuItemsSchema with empty items array', () => {
  it('should validate an empty items array', () => {
    const validItems = {
      items: [],
    };

    const result = alfredMenuItemsSchema.safeParse(validItems);
    expect(result.success).toBe(true);
  });
});

describe('alfredMenuItemsSchema with single item', () => {
  it('should validate an array with a single menu item', () => {
    const validItems = {
      items: [
        {
          uid: 'uid-1',
          title: 'Title 1',
          arg: 'arg-1',
          autocomplete: 'autocomplete-1',
        },
      ],
    };

    const result = alfredMenuItemsSchema.safeParse(validItems);
    expect(result.success).toBe(true);
  });
});

describe('alfredMenuItemsSchema with optional fields', () => {
  it('should validate menu items missing optional fields', () => {
    const validItems = {
      items: [
        {
          uid: 'uid-1',
          title: 'Title 1',
          arg: 'arg-1',
        },
        {
          uid: 'uid-2',
          title: 'Title 2',
          arg: 'arg-2',
        },
      ],
    };

    const result = alfredMenuItemsSchema.safeParse(validItems);
    expect(result.success).toBe(true);
  });
});

describe('alfredMenuItemsSchema with subtitle field', () => {
  it('should validate menu items with subtitle field', () => {
    const validItems = {
      items: [
        {
          uid: 'uid-1',
          title: 'Title 1',
          subtitle: 'Subtitle 1',
          arg: 'arg-1',
        },
        {
          uid: 'uid-2',
          title: 'Title 2',
          subtitle: 'Subtitle 2',
          arg: 'arg-2',
        },
      ],
    };

    const result = alfredMenuItemsSchema.safeParse(validItems);
    expect(result.success).toBe(true);
  });
});
