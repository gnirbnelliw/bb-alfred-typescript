import { type AlfredMenuItem, alfredMenuItemSchema } from '../schemas/alfred-menu-item.js';
import { urlSchema } from '../schemas/url';

/**
 * Generates an Alfred Menu Item from a given link.
 * @param link { string }
 * @returns { AlfredMenuItem }
 */
export const alfredMenuItemFromLink = (link: string): AlfredMenuItem => {
  const validURL = urlSchema.parse(link);
  return alfredMenuItemSchema.parse({
    uid: validURL,
    type: 'file' as const,
    title: validURL,
    arg: validURL,
    autocomplete: validURL,
    icon: {
      type: 'fileicon' as const,
      path: 'img/icons/url.png',
    },
  });
};

export const alfredMenuItemFromCommandFragment = (cmd: string): AlfredMenuItem => {
  return alfredMenuItemSchema.parse({
    uid: cmd,
    type: 'default' as const,
    title: cmd,
    arg: cmd,
    autocomplete: cmd,
    icon: {
      type: 'fileicon' as const,
      path: 'img/icons/command.png',
    },
  });
};