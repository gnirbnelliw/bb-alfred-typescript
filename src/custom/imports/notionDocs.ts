import type { z } from 'zod';
import { CustomFunction } from '..';
import { type customFuncInputItemSchema, customFuncInputsSchema } from '../';

const notionLinks = customFuncInputsSchema.parse([
  {
    title: 'Notion: User Software Journey',
    subtitle: 'something whimsical',
    arg: 'https://www.notion.so/onebrief/Software-User-Journey-1-2a5e3bddbaa88035af99cbf3e1495679',
  },
  {
    title: 'Notion: Formula Syntax docs',
    subtitle: 'Details on how to use Notion formulas',
    arg: 'https://www.notion.com/help/formula-syntax#properties',
  },
  {
    title: 'SRE Deployment windows from Notion',
    subtitle: 'SIPR, JWICS, CENTRIXS-J, CENTRIXS-GREEN, NIPR Deployment dates',
    arg: 'https://www.notion.so/onebrief/SRE-281e3bddbaa8800ab9c5f7291d4a1fd9?source=copy_link#294e3bddbaa8802baf78c2122368ed09',
  },
]);

// Define function that provides Alfred its {query} arg
const fn = (arg: z.infer<typeof customFuncInputItemSchema>) => {
  return typeof arg === 'string' ? arg : (arg.arg ?? '');
};

const notionMenus = new CustomFunction<string>({
  inputs: notionLinks,
  iconPath: 'dist/img/icons/notion.png',
}).menus(fn);

export { notionMenus };
