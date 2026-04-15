import fs from 'fs/promises';
import path from 'path';

const ROOT_DIR = process.cwd();

const pathsToRemove = [
  '.backup_replit',
  '.replit',
  '.replitignore',
  'replit.md',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  'artifacts', // In case any are left
  'lib', // Old lib folder
];

async function cleanup() {
  console.log('--- [BUILDER PROCESS] Starting Asynchronous Cleanup ---');
  
  for (const item of pathsToRemove) {
    const itemPath = path.join(ROOT_DIR, item);
    try {
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        await fs.rm(itemPath, { recursive: true, force: true });
        console.log(`[CLEANUP] Removed directory: ${item}`);
      } else {
        await fs.unlink(itemPath);
        console.log(`[CLEANUP] Removed file: ${item}`);
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log(`[SKIP] Item not found: ${item}`);
      } else {
        console.error(`[ERROR] Failed to remove ${item}:`, e.message);
      }
    }
  }

  console.log('--- [BUILDER PROCESS] Cleanup Completed Successfully ---');
}

cleanup().catch(err => {
  console.error('[FATAL ERROR] Cleanup failed:', err);
  process.exit(1);
});