import { z } from 'zod';
import type { alfredIconSchema } from '../schemas/alfred-icon';
import type { alfredMenuItemSchema } from '../schemas/alfred-menu-item';
import { alfredMenuItemFromCustomFunction } from '../schemas/custom-function';

/**
 * Schema for custom function input `object`. @see {@link customFuncInputItemSchema} and {@link customFuncInputsSchema}.
 *
 */
export const customFuncInputObjectSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().min(1).optional(), // Emojis / Unicode
  autocomplete: z.string().min(1).optional(),
  arg: z.string().min(1).optional(),
  iconPath: z.string().min(18).default('dist/img/icons/alfred.png').optional(),
});

/**
 * Schema for custom function input item — `object | string`. @see {@link customFuncInputObjectSchema} and {@link customFuncInputItemSchema}.
 */
export const customFuncInputItemSchema = z.union([customFuncInputObjectSchema, z.string()]);

/**
 * Schema for custom function input items (`Array`). @see {@link customFuncInputItemSchema} and {@link customFuncInputObjectSchema}.
 */
export const customFuncInputsSchema = z.array(customFuncInputObjectSchema.or(z.string()));

/**
 * Schema for custom function generator.
 */
export const customFuncSchema = z.object({
  inputs: customFuncInputsSchema,
  iconPath: z.string().min(18).default('dist/img/icons/alfred.png').optional(),
});

/**
 * Generates an AlfredMenuItem from custom function props.
 * @param params { alfredCustomFunctionPropsSchema }
 * @returns { AlfredMenuItem }
 */
export class CustomFunction<T> {
  inputs: z.infer<typeof customFuncInputsSchema>;
  iconPath?: z.infer<typeof alfredIconSchema>['path'];

  constructor(params: z.infer<typeof customFuncSchema>) {
    this.inputs = params.inputs;
    this.iconPath = params.iconPath;
  }

  getMatchingWords(
    input: z.infer<typeof customFuncInputItemSchema>,
    arg?: string | undefined,
  ): string {
    let match: string;
    if (typeof input === 'string') {
      match = `${input} ${arg ?? ''}`.trim();
    } else {
      match = `${input.title} ${input.subtitle ?? ''} ${input.arg ? input.arg : (arg ?? '')}`;
    }
    // Split matching words into array, then uniquify and rejoin
    const wordArray = match.split(' ').map((word) => word.trim());
    const matchWords = Array.from(new Set(wordArray));
    return `${matchWords.join(' ').trim()}`;
  }

  /**
   *
   * @param fn Function that provides each class member its {query} arg.
   * @returns { AlfredMenuItem[] }
   */
  menus(
    fn: (input: z.infer<typeof customFuncInputItemSchema>) => string,
  ): z.infer<typeof alfredMenuItemSchema>[] {
    return this.inputs.map((input) => {
      const title = typeof input === 'string' ? input : input.title;
      const subtitle = typeof input === 'string' ? '' : (input.subtitle ?? '');
      const arg = fn(input);

      // eslint-disable-next-line no-param-reassign
      const inputObj =
        typeof input === 'string' ? { title, subtitle, arg } : { ...input, title, subtitle, arg };

      const autocomplete = this.getMatchingWords(inputObj, arg);
      return alfredMenuItemFromCustomFunction({
        uid: `uid-${title}`,
        title,
        subtitle,
        autocomplete,
        arg,
        iconPath: this.iconPath,
      });
    });
  }
}
