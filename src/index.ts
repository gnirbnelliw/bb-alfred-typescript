import type { z } from 'zod';
import { bashCommandMenus } from './custom/imports/commands';
import { emojiMenus } from './custom/imports/emojis';
import { mermaidMenus } from './custom/imports/mermaid';
import { notionMenus } from './custom/imports/notionDocs';
import { militaryOrderMenus, unicodeMenus } from './custom/imports/textSnippets';
// import { militaryOrderMenus, unicodeArrowMenus } from './custom/imports/textSnippets';
import { alfredMenuItemsSchema, type alfredVariableSchema } from './schemas/alfred-menu-item';

const getVariables = () => {
  const variables: z.infer<typeof alfredVariableSchema> = {
    creator: 'Ben Willenbring',
  };
  return variables;
};

try {
  const menuItems = alfredMenuItemsSchema.parse({
    items: [
      ...bashCommandMenus,
      ...emojiMenus,
      ...notionMenus,
      ...militaryOrderMenus,
      ...unicodeMenus,
      ...mermaidMenus,
    ],
    variables: getVariables(),
  });

  // Output JSON for Alfred
  console.log(JSON.stringify(menuItems, null, 2));
} catch (error) {
  // Output error in Alfred-compatible format
  console.log(
    JSON.stringify({
      items: [
        {
          uid: 'error',
          title: 'Error',
          subtitle: error instanceof Error ? error.message : 'Unknown error',
          valid: false,
        },
      ],
    }),
  );
  process.exit(1);
}
