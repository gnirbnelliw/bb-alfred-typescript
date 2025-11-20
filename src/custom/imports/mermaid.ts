import type { z } from 'zod';
import { CustomFunction } from '..';
import { type customFuncInputItemSchema, customFuncInputsSchema } from '../';

const mermaidItems = customFuncInputsSchema.parse([
  {
    title: 'Mermaid: Shape: Comment',
    arg: 'S1@{ shape: braces, label: "Comment" }',
  },
  {
    title: 'Mermaid: Shape: Circle',
    arg: 'S1(( Circle ))',
  },
]);

// Define function that provides Alfred its {query} arg
const fn = (arg: z.infer<typeof customFuncInputItemSchema>) => {
  return typeof arg === 'string' ? arg : (arg.arg ?? '');
};

const mermaidMenus = new CustomFunction<string>({
  inputs: mermaidItems,
  iconPath: 'dist/img/icons/mermaid.png',
}).menus(fn);

export { mermaidMenus };
