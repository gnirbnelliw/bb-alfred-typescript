import type { z } from 'zod';
import { CustomFunction } from '..';
import { type customFuncInputItemSchema, customFuncInputsSchema } from '../';
import { getLastNPRs } from '../functions/git';

export const bashCommands = customFuncInputsSchema.parse([
  {
    title: 'gh auth token',
    subtitle: 'Prints the GitHub CLI authentication token',
    arg: 'gh auth token',
  },
  {
    title: 'gh auth status',
    subtitle: 'Prints the GitHub CLI authentication status',
    arg: 'gh auth status',
  },
  {
    title: 'Get Date',
    subtitle: 'Returns the current date',
    arg: 'date',
  },
  {
    title: 'List Files',
    subtitle: 'Lists files in the current directory',
    arg: 'ls -la',
  },
  {
    title: 'Calculate size of Workflow',
    subtitle: 'Calculates the total size of the Alfred workflow directory',
    arg: 'size=$(du -sh) && echo "Workflow size: $size"',
  },
  {
    title: 'Calculate size of Desktop files',
    subtitle: 'Calculates the total size of files on the Desktop',
    arg: `echo -n "Total size of Desktop: $(du -sh ~/Desktop | awk '{print $1}')"`,
  },
  {
    title: 'Prints node version',
    subtitle: 'Prints the current Node.js version',
    arg: 'node -v',
  },
  {
    title: 'Prints node version and path and other stuff',
    subtitle: 'Troubleshooting command to print node version, path, and nvm versions',
    arg: 'which node && echo $PATH && ls -l ~/.nvm/versions/node',
  },
  {
    title: 'Prints yarn version',
    subtitle: 'Prints the current Yarn version',
    arg: 'yarn -v',
  },
  {
    title: 'Says Hello',
    subtitle: 'Prints Hello to the console',
    arg: 'say hello',
  },
  {
    title: 'printenv',
    subtitle: 'Prints all environment variables',
    arg: 'printenv',
  },
  {
    title: 'Rebuild and resync Alfred with yarn: sync:alfred',
    type: 'terminal',
    subtitle: 'Rebuild and resync Alfred with yarn sync:alfred',
    arg: 'cd /Users/benjaminwillenbring/Desktop/qa/bb-alfred-typescript && yarn test && yarn sync:alfred',
  },
  {
    title: 'pwd',
    subtitle: 'Opens the current working directory',
    arg: 'dir=$(pwd) && open "$dir" && echo $dir',
  },
]);

// Define function that provides Alfred its {query} arg
const fn = (arg: z.infer<typeof customFuncInputItemSchema>) => {
  // Handle both string and object inputs
  return typeof arg === 'string' ? `eval:${arg}` : `eval:${arg.arg ?? 'echo No arg provided'}`;
};

const bashCommandMenus = new CustomFunction<string>({
  inputs: bashCommands,
  iconPath: 'dist/img/icons/bash.png',
}).menus(fn);

export { bashCommandMenus };
