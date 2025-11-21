import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as net from 'node:net'; // ✅ ESM-safe native import
import * as path from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Eta } from 'eta';
import { Hono } from 'hono';
import { config } from './utils/workflowUtils';
import { loadWorkflowVariables } from './utils/workflowUtils';

const PORT = config.port;
const HOST = config.host;

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
    header: eta.render('partials/header', {}),
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

// Pre-populate with workflow variables where appropriate...
const vars = loadWorkflowVariables()?.variables || {};

// Dynamic pages
app.get('/', (c) => c.html(renderPage('home', { name: 'Workflow Configuration' })));
app.get('/home', (c) => c.html(renderPage('home', { ...vars, name: '🏠 Home' })));
app.get('/about', (c) => c.html(renderPage('about', { name: '🗃️ About' })));
app.get('/custom', (c) => c.html(renderPage('custom', { name: '🔥 Custom' })));
app.get('/help', (c) => c.html(renderPage('help', { name: '❤️	Help' })));

app.get('/xhr', (c) => {
  return c.json({ status: 'ok', message: 'This is a response from the /xhr endpoint.' });
});

// ----------------------------------------------------------------------------
// Static assets
// ----------------------------------------------------------------------------

const STATIC_PREFIXES = ['/assets/'];

function staticMiddleware() {
  return serveStatic({
    root: WWW_ROOT,
    rewriteRequestPath: (p) => p, // serve exactly as requested
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
export async function startServer(): Promise<void> {
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
