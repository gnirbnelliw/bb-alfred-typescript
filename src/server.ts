import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as net from 'node:net'; // ✅ ESM-safe native import
import * as path from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Eta } from 'eta';
import { type Context, Hono } from 'hono';
import { getEnv, getEnvironmentVariables } from './utils/environment';

const PORT = Number(getEnv('SERVER_PORT'));
const HOST = getEnv('HOST');
// ----------------------------------------------------------------------------
// Paths
// ----------------------------------------------------------------------------
const vars = getEnvironmentVariables();

// ----------------------------------------------------------------------------
// Paths
// ----------------------------------------------------------------------------
const HERE = __dirname;
// If dist/www exists → use it
const DIST_WWW = path.join(HERE, 'www');
const SRC_WWW = path.join(HERE, '..', 'src', 'www');
const WWW_ROOT = fs.existsSync(DIST_WWW) ? DIST_WWW : SRC_WWW;

// ----------------------------------------------------------------------------
// Eta
// ----------------------------------------------------------------------------
const eta = new Eta({ views: WWW_ROOT });

// Simple page renderer
function renderPage(name: string, data: Record<string, unknown> = {}) {
  const ctx = {
    title: data.title || 'Alfred Workflow',
    header: eta.render('partials/header', { ...vars }),
    footer: eta.render('partials/footer', {}),
    body: eta.render(`pages/${name}`, data),
    leftCol: eta.render('partials/leftCol', {}),
  };

  return eta.render('layouts/base', ctx) || '';
}

// ----------------------------------------------------------------------------
// Hono app + routes
// ----------------------------------------------------------------------------
const app = new Hono();

const renderRoute =
  (page: string, data: Record<string, unknown> = {}) =>
  (c: Context) =>
    c.html(renderPage(page, data));

app.get('/', renderRoute('home', { ...vars, name: '🏠 Quick Start' }));
app.get('/home', renderRoute('home', { ...vars, name: '🏠 Quick Start' }));

app.get('/about', renderRoute('about', { name: '🗃️ About' }));
app.get('/custom', renderRoute('custom', { name: '🔥 Custom Automations' }));
app.get('/how', renderRoute('how-it-works', { name: '❤️ How It Works' }));
app.get('/standard', renderRoute('standard', { name: '📊 Standard Automations' }));

app.get('/xhr', (c) => {
  return c.json({
    status: 'ok',
    message: 'This is a response from the /xhr endpoint.',
  });
});

// ----------------------------------------------------------------------------
// Static assets
// ----------------------------------------------------------------------------

const STATIC_PREFIXES = ['/assets/'];

function staticMiddleware() {
  return serveStatic({
    root: WWW_ROOT,
    rewriteRequestPath: (p) => p, // leave lookup untouched
  });
}

app.use('*', (c, next) => {
  const p = c.req.path;
  return STATIC_PREFIXES.some((pref) => p.startsWith(pref)) ? staticMiddleware()(c, next) : next();
});

// ----------------------------------------------------------------------------
// Server Functions
// ----------------------------------------------------------------------------
/**
 *
 * @param port { number } Port number to run the server on.
 * @param host { string } Hostname to run the server on.
 * @returns { Promise<boolean> } Whether the server is running on the given port and host. @see {@link startServer}
 */
export function serverIsRunning(port: number = PORT, host: string = HOST): Promise<boolean> {
  // Return whether or not the server is running on the given port at the host.
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(1000); // 1 second timeout

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.on('timeout', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

/**
 * Starts the Hono server if not already running. @see {@link serverIsRunning}
 * @returns { Promise<void> }
 */
export async function startServer_old(): Promise<void> {
  const running = await serverIsRunning(PORT, HOST);
  if (running) {
    console.log(`🔥 Already running at http://${HOST}:${PORT}`);
    return;
  }

  console.log('🚀 Starting server...');
  serve({ fetch: app.fetch, hostname: HOST, port: PORT }, () => {
    console.log(`✅ Server running at http://${HOST}:${PORT}`);
  });
}

export const killServer = async (port: number = PORT, host: string = HOST): Promise<void> => {
  // If it's running do nothing
  const running = await serverIsRunning(port, host);
  if (!running) {
    console.log(`🛑 Server not running at http://${host}:${port}`);
    return;
  }
  // Execute this command: `lsof -ti :${PORT} | xargs kill -9`
  const cmd = `lsof -ti :${port} | xargs kill -9`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error killing server: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr while killing server: ${stderr}`);
      return;
    }
    console.log(`✅ Killed server running at http://${host}:${port}`);
  });
};

/**
 * Start the local server if not already running,
 * ensure it is running, then open the browser.
 */
export async function startServer(route = 'home'): Promise<void> {
  const url = `http://${HOST}:${PORT}/${route}`;

  // If already running → just open browser
  if (await serverIsRunning(PORT, HOST)) {
    console.log(`🔥 Server already running at ${url}`);
    openBrowser(url);
    return;
  }

  // Not running → start server
  console.log('🚀 Starting server...');
  serve({ fetch: app.fetch, hostname: HOST, port: PORT }, () => {
    console.log(`✅ Server running at ${url}`);

    // Wait a moment for the port to fully bind
    setTimeout(() => openBrowser(url), 150);
  });
}

/** Opens a browser reliably on macOS */
function openBrowser(url: string): void {
  const script = `
    set targetURL to "${url}"
    set hostPrefix to "http://${HOST}"

    -- Ensure Chrome is running
    if application "Google Chrome" is not running then
      tell application "Google Chrome" to activate
      delay 0.25
    end if

    tell application "Google Chrome"
      set foundTab to missing value
      set foundWindow to missing value

      -- Find a tab whose URL starts with hostPrefix
      repeat with w in windows
        repeat with t in tabs of w
          if URL of t starts with hostPrefix then
            set foundTab to t
            set foundWindow to w
            exit repeat
          end if
        end repeat
        if foundTab is not missing value then exit repeat
      end repeat

      if foundTab is missing value then
        -- No tab exists → open a new one with the target URL
        if (count of windows) = 0 then
          make new window
        end if

        set foundWindow to window 1
        set foundTab to make new tab at foundWindow with properties {URL:targetURL}

      else
        -- A matching tab exists → refresh (reload) it
        tell foundTab to reload
      end if

      -- Focus the correct tab and window
      set active tab of foundWindow to foundTab
      set index of foundWindow to 1
      activate
    end tell
  `;

  exec(`osascript -e '${script.replace(/'/g, "\\'")}'`);
}
