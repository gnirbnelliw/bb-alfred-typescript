import { z } from 'zod';
import { alfredIconSchema } from './alfred-icon';
import type { AlfredMenuItem } from './alfred-menu-item';
import { alfredMenuItemSchema } from './alfred-menu-item.js';

// Zod schema to validate all custom commands are () => string
export const customFunctionSchema = z.function({
  input: [z.unknown()],
  output: z.string(),
});

export type CustomFunctionType = z.infer<typeof customFunctionSchema>;

// Zod schema for custom function generator props
export const alfredCustomFunctionPropsSchema = z.object({
  uid: z.string().optional(),
  title: z.string().min(5),
  subtitle: z.string().min(5).optional(),
  autocomplete: z.string().optional(),
  arg: z.string().min(1),
  iconPath: z
    .string()
    .optional()
    .refine((p) => p?.startsWith('dist/img/icons/')),
});

/**
 * Generates an AlfredMenuItem from custom function props.
 * @param params { alfredCustomFunctionPropsSchema }
 * @returns { AlfredMenuItem }
 */
export const alfredMenuItemFromCustomFunction = (
  params: z.infer<typeof alfredCustomFunctionPropsSchema>,
): AlfredMenuItem => {
  // Destructure params
  const { title, subtitle, autocomplete, arg, iconPath } = params;
  // return an AlfredMenuItem
  return alfredMenuItemSchema.parse({
    uid: `custom-function-${title}`,
    title: title,
    subtitle: subtitle ? subtitle : `Cutom function: ${title}`,
    arg,
    match: autocomplete ? autocomplete : title,
    autocomplete: autocomplete ? autocomplete : title,
    icon: alfredIconSchema.parse({
      path: iconPath ? iconPath : 'dist/img/icons/bash.png',
    }),
  });
};
