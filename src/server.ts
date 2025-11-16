import * as fs from 'node:fs';
// import net from 'net';
import * as net from 'node:net'; // ✅ ESM-safe native import
// import path from 'path';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
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

console.log('📂 Serving from:', WWW_ROOT);

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
  };

  return eta.render('layouts/base', ctx) || '';
}

// ----------------------------------------------------------------------------
// Hono app + routes
// ----------------------------------------------------------------------------
const app = new Hono();

// Pre-populate...
const vars = loadWorkflowVariables()?.variables || {};

// Dynamic pages
app.get('/', (c) => c.html(renderPage('home', { name: 'Workflow Configuration' })));
app.get('/home', (c) => c.html(renderPage('home', { ...vars, name: 'Workflow Configuration' })));
app.get('/about', (c) => c.html(renderPage('about', { name: 'About' })));
// app.get('/today', (c) => c.html(renderPage('today', { name: 'Today' })));
app.get('/help', (c) => c.html(renderPage('help', { name: 'Today' })));

// ----------------------------------------------------------------------------
// Hot reloading (dev only)
// ----------------------------------------------------------------------------

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
// Start server unless it's already running
// ----------------------------------------------------------------------------
function serverIsRunning(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const s = net.connect({ port, host }, () => {
      s.end();
      resolve(true);
    });
    s.on('error', () => resolve(false));
  });
}

async function startServer() {
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

startServer();
