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
      path: iconPath ? iconPath : 'dist/img/icons/url.png',
    },
  });
};


export const alfredCommandPropsSchema = z.object({
  cmd: z.string().min(2),
  text: z.string().min(5).optional(),
  commandType: z
    .string()
    .default('eval')
    .transform((val) => {
      if (!['eval', 'terminal'].includes(val)) return 'eval';
      return val;
    }),
  iconPath: z
    .string()
    .optional()
    .refine((p) => p?.startsWith('dist/img/icons/')),
});

/**
 *
 * @param cmd { string }
 * @returns
 */
export const alfredMenuItemFromCommand = (
  params: z.input<typeof alfredCommandPropsSchema>,
): AlfredMenuItem => {
  const { cmd, text, iconPath } = params;
  const commandType = `${params.commandType ?? 'eval'}`;

  const arg = `${commandType}:${cmd}`;
  const subtitlePrefix = commandType === 'eval' ? 'Run command:' : 'Launch terminal:';
  const subtitle = `${subtitlePrefix} ${text ?? cmd}`;

  return alfredMenuItemSchema.parse({
    uid: cmd,
    title: text ? text : cmd,
    subtitle,
    arg,
    autocomplete: cmd,
    icon: {
      path: iconPath ? iconPath : 'dist/img/icons/bash.png',
    },
  });
};