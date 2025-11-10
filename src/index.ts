import path from 'path';
import type { z } from 'zod';
import { alfredMenuItemsSchema, type alfredVariableSchema } from './schemas/alfred-menu-item';
import { alfredMenuItemFromLink } from './utils/menuUtils';

const getVariables = () => {
  const variables: z.infer<typeof alfredVariableSchema> = {
    creator: 'Ben Willenbring',
  };
  return variables;
};

try {
  // Generate dynamic menu items based on query
  const menuItems = alfredMenuItemsSchema.parse({
    items: [
      alfredMenuItemFromLink({
        link: 'https://nodejs.org',
        text: 'Node.js Homepage',
        iconPath: 'dist/img/icons/node.png',
      }),
      {
        uid: 'get-node-version',
        title: 'Prints the node version',
        subtitle: 'Uses node -v',
        arg: 'eval:node -v',
        autocomplete: 'eval:node -v',
        icon: { path: 'dist/img/foo.png' },
      },
      {
        uid: 'run-terminal-command-1',
        title: 'Runs terminal command: ls -la',
        subtitle: 'Example: ls -la',
        arg: 'terminal:ls -la',
        autocomplete: 'terminal:ls -la',
      },
      {
        uid: 'run-terminal-command-2',
        title: 'Runs terminal command: pwd',
        subtitle: 'Example: pwd',
        arg: 'terminal:pwd',
        autocomplete: 'terminal:pwd',
      },
      {
        uid: 'display-markdown-sample',
        title: 'Displays a sample markdown',
        subtitle: 'Shows how markdown rendering works',
        arg: 'markdown:markdown/sample.md',
        autocomplete: 'markdown: Sample Markdown',
      },
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
