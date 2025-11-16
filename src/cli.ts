import { exec } from 'child_process';
import type { z } from 'zod';
import type { cliActionSchema } from './schemas/cli-schema';
import { killServer, serverIsRunning, startServer } from './server';
import { getCLIParams } from './utils/workflowUtils';

const osaEscape = (str: string) => {
  // Remove problematic characters for osascript.
  return str.replace(/(["\\$`])/g, '\\$1');
};

/**
 *
 * @param action { cliActions } Inferred from {@link cliActionSchema}
 * @param argument { string | undefined } Optional argument to pass to Alfred.
 */
const runAlfred = (action: z.infer<typeof cliActionSchema>, argument?: string): void => {
  // Replace single quotes with smart quotes to avoid AppleScript issues
  const normalizedArgument = osaEscape(argument?.replace(/'/g, '’') ?? '');

  const script = `
    osascript -e 'tell application id "com.runningwithcrayons.Alfred"
      run trigger "${action}" in workflow "com.ben-willenbring.ts" with argument "${normalizedArgument}"
    end tell'
    `;

  exec(script, (error, stderr) => {
    if (error) {
      console.error(`Error executing AppleScript: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`AppleScript stderr: ${stderr}`);
      return;
    }
  });
};

(async () => {
  // Get the cli parameters
  const cliParams = getCLIParams();

  // ------------------------------------------------------
  // Action: serverStatus
  if (cliParams.action === 'server-status') {
    // Print the status
    const status = await serverIsRunning();
    console.log(status);
  }

  // ------------------------------------------------------
  // Action: navigate
  else if (cliParams.action === 'home') {
    // Find out if the server is running, and if not, start it
    const isRunning = await serverIsRunning();
    if (!isRunning) {
      void startServer(); // fire-and-forget
    }

    // Poll until it’s actually listening
    const maxWaits = 50;
    let counter = 0;

    while (!(await serverIsRunning())) {
      if (counter >= maxWaits) {
        console.error('❌ Server did not start in time.');
        process.exit(1);
      }
      counter++;
      await new Promise((r) => setTimeout(r, 50));
    }

    runAlfred('home');
  }

  // ------------------------------------------------------
  // Action: terminalCommand
  else if (cliParams.action === 'terminal-command') {
    runAlfred('terminal-command');
  }

  // ------------------------------------------------------
  // Action: killServer
  else if (cliParams.action === 'kill-server') {
    await killServer();
  }
  // ------------------------------------------------------

  // Action: notify
  else if (cliParams.action === 'notify') {
    runAlfred('notify', cliParams.argument);
  }

  // ------------------------------------------------------
})();
