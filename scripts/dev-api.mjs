import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backend = fileURLToPath(new URL('../backend/', import.meta.url));
const require = createRequire(new URL('../backend/package.json', import.meta.url));
const wrangler = resolve(
  dirname(require.resolve('wrangler/package.json')),
  'bin/wrangler.js',
);
let child;
let restarting = false;
let pending = false;
let stopping = false;
let debounce;

function run(args) {
  const process = spawn(globalThis.process.execPath, [wrangler, ...args], {
    cwd: backend,
    stdio: 'inherit',
    env: globalThis.process.env,
  });
  child = process;
  return new Promise((resolve) => {
    process.once('error', (error) => {
      console.error(error.message);
      resolve(1);
    });
    process.once('exit', (code) => {
      if (child === process) child = undefined;
      resolve(code ?? 1);
    });
  });
}
async function stopChild() {
  const active = child;
  if (!active) return;
  await new Promise((resolve) => {
    active.once('exit', resolve);
    active.kill('SIGTERM');
  });
}
async function restart() {
  pending = true;
  if (restarting || stopping) return;
  restarting = true;
  try {
    while (pending && !stopping) {
      pending = false;
      await stopChild();
      if (stopping) break;
      console.log('[api] Preparing the configured local database…');
      const status = await run(['d1', 'migrations', 'apply', 'DB', '--local']);
      if (stopping) break;
      if (status !== 0) {
        console.error(
          '[api] Database setup failed. Fix the migration or configuration; the API will restart when it changes.',
        );
        continue;
      }
      if (pending) continue;
      // Do not wait for the long-running server before handling another config change.
      void run([
        'dev',
        '--port',
        '8787',
        '--var',
        'ALLOWED_ORIGINS:http://localhost:3000',
        '--var',
        'ENVIRONMENT:development',
      ]);
    }
  } finally {
    restarting = false;
  }
}
function schedule() {
  clearTimeout(debounce);
  debounce = setTimeout(() => void restart(), 300);
}
// Wrangler reloads changed bindings, but does not migrate their local database.
// Restart through migration setup so a new binding never stays on an empty schema.
const watchers = [
  watch(backend, (_, file) => {
    if (file === 'wrangler.jsonc') schedule();
  }),
  watch(resolve(backend, 'migrations'), (_, file) => {
    if (file?.endsWith('.sql')) schedule();
  }),
];
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, async () => {
    if (stopping) return;
    stopping = true;
    clearTimeout(debounce);
    watchers.forEach((watcher) => watcher.close());
    await stopChild();
    process.exit(0);
  });
await restart();
