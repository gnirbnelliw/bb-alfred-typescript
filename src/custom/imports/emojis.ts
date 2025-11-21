import type { z } from 'zod';
import { CustomFunction } from '..';
import { type customFuncInputItemSchema, customFuncInputsSchema } from '../';

// Trap the user's typed input into Alfred
const query = process.argv[2] || '';

const emojis = customFuncInputsSchema.parse([
  {
    title: 'Emoji: smiling face 😊',
    subtitle: 'Smiling face emoji',
    arg: '😊',
  },
  {
    title: 'Emoji: cry 😢',
    subtitle: 'Sad face emoji',
    arg: '😢',
  },
  {
    title: 'Emoji: laugh 😂',
    subtitle: 'Laughing face emoji',
    arg: '😂',
  },
  {
    title: 'Emoji: wink 😉',
    subtitle: 'Winking face emoji',
    arg: '😉',
  },
  {
    title: 'Emoji: thumbsUp 👍',
    subtitle: 'Thumbs up emoji',
    arg: '👍',
  },
  {
    title: 'Emoji: thumbsDown 👎',
    subtitle: 'Thumbs down emoji',
    arg: '👎',
  },
  {
    title: 'Emoji: fire 🔥',
    subtitle: 'For when things get HOT',
    arg: '🔥',
  },
  {
    title: 'Emoji: star ⭐',
    subtitle: 'Star emoji',
    arg: '⭐',
  },
  {
    title: 'Emoji: heart ❤️',
    subtitle: 'Heart emoji',
    arg: '❤️',
  },
  {
    title: 'Emoji: poo 💩',
    subtitle: 'For when things are like sh*t',
    arg: '💩',
  },
  {
    title: 'Emoji: usa 🇺🇸',
    subtitle: 'United States flag emoji',
    arg: '🇺🇸',
  },
  {
    title: 'Emoji: france 🇫🇷',
    subtitle: 'French flag emoji',
    arg: '🇫🇷',
  },
  {
    title: 'Emoji: animal:cat 🐱',
    subtitle: 'Cat emoji',
    arg: '🐱',
  },
  {
    title: 'Emoji: animal:dog 🐶',
    subtitle: 'Dog emoji',
    arg: '🐶',
  },
  {
    title: 'Emoji: object:gear ⚙️',
    subtitle: 'Gear emoji',
    arg: '⚙️',
  },
]);

// Define function that provides Alfred its {query} arg
const fn = (arg: z.infer<typeof customFuncInputItemSchema>) => {
  // Handle both string and object inputs
  return typeof arg === 'string' ? arg : (arg.arg ?? 'echo No arg provided');
};

const emojiMenus = new CustomFunction<string>({
  inputs: emojis.filter((item) => {
    // Only include items that match query
    const title = typeof item === 'string' ? item : item.title;
    const arg = typeof item === 'string' ? '' : (item.arg ?? '');
    const subtitle = typeof item === 'string' ? '' : (item.subtitle ?? '');
    return [title, subtitle, arg].some((field) =>
      field.toLowerCase().includes(query.toLowerCase()),
    );
  }),
  iconPath: 'dist/img/icons/emoji.png',
}).menus(fn);

export { emojiMenus };
