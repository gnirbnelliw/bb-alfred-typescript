import { z } from 'zod';
import { type AlfredMenuItem, alfredMenuItemSchema } from '../schemas/alfred-menu-item.js';
import { urlSchema } from '../schemas/url';


export const alfredLinkPropsSchema = z.object({
  link: z.url().refine((url) => urlSchema.parse(url)),
  text: z.string().min(5).optional(),
  iconPath: z
    .string()
    .optional()
    .refine((p) => p?.startsWith('dist/img/icons/')),
});


/**
 * Generates an Alfred Menu Item from a given link.
 * @param link { string }
 * @returns { AlfredMenuItem }
 */
export const alfredMenuItemFromLink = (
  params: z.infer<typeof alfredLinkPropsSchema>,
): AlfredMenuItem => {
  const { link, text, iconPath } = params;
  const validURL = urlSchema.parse(link);
  return alfredMenuItemSchema.parse({
    uid: validURL,
    title: text ? text : validURL,
    subtitle: `Link: ${validURL}`,
    arg: validURL,
    autocomplete: `${text ?? validURL}`,
    icon: {
      type: 'fileicon' as const,
      path: iconPath ? iconPath : 'dist/img/icons/url.png',
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
      path: 'dist/img/icons/command.png',
    },
  });
};