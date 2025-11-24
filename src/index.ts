import type { z } from 'zod';
import { getLastNPRs } from './custom/functions/git';
import { bashCommandMenus } from './custom/imports/commands';
import { emojiMenus } from './custom/imports/emojis';
import { mermaidMenus } from './custom/imports/mermaid';
import { notionMenus } from './custom/imports/notionDocs';
import { loremMenus, militaryOrderMenus, unicodeMenus } from './custom/imports/textSnippets';
import { alfredMenuItemsSchema, type alfredVariableSchema } from './schemas/alfred-menu-item';
import { alfredMenuItemFromParams } from './utils/menuUtils';
import { config } from './utils/workflowUtils';

// TODO: Is this really necessary?
const getVariables = () => {
  const variables: z.infer<typeof alfredVariableSchema> = {
    creator: 'Ben Willenbring',
  };
  return variables;
};
// Code goes inside anonymous async function, and is executed immediately
(async () => {
  // Combine all menu items
  try {
    // Create a completely custom
    const m1 = alfredMenuItemFromParams({
      uid: 'custom-1',
      title: 'Get Last 5 PRs',
      subtitle: 'This is a custom menu item',
      arg: await getLastNPRs(5),
      autocomplete: 'Custom Menu Item 1',
      icon: { path: 'dist/img/icons/alfred.png' },
    });
    const m2 = alfredMenuItemFromParams({
      uid: 'custom-2',
      title: 'Help help help',
      subtitle: 'Outputs configured workflow variables as JSON',
      arg: 'http://127.0.0.1:9393/help',
      autocomplete: 'Help for the localhost server',
      icon: { path: 'dist/img/icons/super-chimp.png' },
    });
    const m3 = alfredMenuItemFromParams({
      uid: 'custom-3',
      title: 'Workflow Data Path - the whole config',
      subtitle: 'The entire workflow config as JSON',
      arg: JSON.stringify(config, undefined, 2),
      autocomplete: 'Workflow Bundle ID',
      icon: { path: 'dist/img/icons/alfred.png' },
    });
    const loadedVars = JSON.stringify(config, undefined, 2);
    const m4 = alfredMenuItemFromParams({
      uid: 'custom-4',
      title: 'Get the config by importing config',
      subtitle: 'Loads config from config.json',
      arg: loadedVars,
      autocomplete: 'Loads config from config.json',
      icon: { path: 'dist/img/icons/gear.png' },
    });

    const m5 = alfredMenuItemFromParams({
      uid: 'custom-5',
      title: 'Notify special',
      subtitle: 'Notify by calling aflred run action',
      arg: 'eval:node dist/cli.js --action notify --argument "Special notification from Alfred!"',
      autocomplete: 'notify special alfred',
      icon: { path: 'dist/img/icons/gear.png' },
    });

    const menuItems = alfredMenuItemsSchema.parse({
      items: [
        ...bashCommandMenus,
        ...emojiMenus,
        ...notionMenus,
        ...militaryOrderMenus,
        ...unicodeMenus,
        ...mermaidMenus,
        ...loremMenus,
        ...[m1, m2, m3, m4, m5],
      ],
      variables: getVariables(),
    });

    // ---------------------------------------------

    // ✅ Otherwise output node-js JSON menu items for Alfred
    console.log(JSON.stringify(menuItems, null, 2));

    // ---------------------------------------------
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
})();
