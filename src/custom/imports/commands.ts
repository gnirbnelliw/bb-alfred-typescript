import type { z } from 'zod';
import { CustomFunction } from '..';
import { type customFuncInputItemSchema, customFuncInputsSchema } from '../';
import { getLastNPRs } from '../functions/git';

export const bashCommands = customFuncInputsSchema.parse([
  {
    title: 'gh auth token',
    subtitle: 'Prints the GitHub CLI authentication token',
    arg: 'eval:gh auth token',
  },
  {
    title: 'gh auth status',
    subtitle: 'Prints the GitHub CLI authentication status',
    arg: 'eval:gh auth status',
  },
  {
    title: 'Get Date',
    subtitle: 'Returns the current date',
    arg: 'eval:date',
  },
  {
    title: 'List Files',
    subtitle: 'Lists files in the current directory',
    arg: 'eval:ls -la',
  },
  {
    title: 'Calculate size of Workflow',
    subtitle: 'Calculates the total size of the Alfred workflow directory',
    arg: 'eval:size=$(du -sh) && echo "Workflow size: $size"',
  },
  {
    title: 'Calculate size of Desktop files',
    subtitle: 'Calculates the total size of files on the Desktop',
    arg: `eval:echo -n "Total size of Desktop: $(du -sh ~/Desktop | awk '{print $1}')"`,
  },
  {
    title: 'Prints node version',
    subtitle: 'Prints the current Node.js version',
    arg: 'eval:node -v',
  },
  {
    title: 'Prints node version and path and other stuff',
    subtitle: 'Troubleshooting command to print node version, path, and nvm versions',
    arg: 'eval:which node && echo $PATH && ls -l ~/.nvm/versions/node',
  },
  {
    title: 'Prints yarn version',
    subtitle: 'Prints the current Yarn version',
    arg: 'terminal: yarn -v',
  },
  {
    title: 'Says Hello',
    subtitle: 'Prints Hello to the console',
    arg: 'eval:say hello',
  },
  {
    title: 'printenv',
    subtitle: 'Prints all environment variables',
    arg: 'eval:printenv',
  },
  {
    title: 'Rebuild and resync Alfred with yarn: sync:alfred',
    subtitle: 'Rebuild and resync Alfred with yarn sync:alfred',
    arg: 'terminal:cd /Users/benjaminwillenbring/Desktop/qa/bb-alfred-typescript && nvm use && yarn test:coverage && yarn sync:alfred',
  },
  {
    title: 'pwd',
    subtitle: 'Opens the current working directory',
    arg: 'terminal:dir=$(pwd) && open "$dir" && echo $dir',
  },
]);

// Define function that provides Alfred its {query} arg
const fn = (arg: z.infer<typeof customFuncInputItemSchema>) => {
  return typeof arg === 'string' ? arg : (arg.arg ?? '');
};

const bashCommandMenus = new CustomFunction<string>({
  inputs: bashCommands,
  iconPath: 'dist/img/icons/bash.png',
}).menus(fn);

export { bashCommandMenus };
