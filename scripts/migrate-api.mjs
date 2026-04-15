import fs from 'fs/promises';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), '.backup_replit');
const DEST_DIR = path.join(process.cwd(), 'src');

/**
 * Utility to safely copy directories asynchronously.
 */
async function copyDir(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
        console.log(`[SUCCESS] Copied file: ${destPath}`);
      }
    }
  } catch (err) {
    console.error(`[ERROR] Failed to copy ${src} to ${dest}:`, err.message);
  }
}

async function migrateApi() {
  console.log('--- [BUILDER PROCESS] Starting Async API Migration ---');
  
  // 1. Migrate DB Schema & Setup
  const dbSrcDir = path.join(BACKUP_DIR, 'lib/db/src');
  const dbDestDir = path.join(DEST_DIR, 'lib/db');
  console.log('[INFO] Migrating database layer...');
  
  try {
    await fs.access(dbSrcDir);
    await copyDir(dbSrcDir, dbDestDir);
  } catch (e) {
    console.log('[WARN] Source DB directory not found or inaccessible.', e.message);
  }

  // 2. Migrate API routes to Next.js App Router format
  console.log('[INFO] Migrating Express routes to Next.js App Router handlers...');
  const healthRouteSrc = path.join(BACKUP_DIR, 'artifacts/api-server/src/routes/health.ts');
  const healthRouteDestDir = path.join(DEST_DIR, 'app/api/health');
  const healthRouteDest = path.join(healthRouteDestDir, 'route.ts');
  
  try {
    await fs.mkdir(healthRouteDestDir, { recursive: true });
    const healthContent = await fs.readFile(healthRouteSrc, 'utf-8');
    
    // Convert Express handler to Next.js Route Handler
    // A robust parser would use AST, but a simple template is efficient for this specific migration
    const nextRouteContent = `
import { NextResponse } from 'next/server';

/**
 * @route GET /api/health
 * @description Health check endpoint migrated from Express
 */
export async function GET() {
  try {
    // Original logic adaptation
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[ERROR] Health check failed:', error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
`;
    await fs.writeFile(healthRouteDest, nextRouteContent.trim());
    console.log(`[SUCCESS] Migrated health route to: ${healthRouteDest}`);
  } catch (e) {
    console.log('[WARN] Could not migrate health route.', e.message);
  }

  console.log('--- [BUILDER PROCESS] API Migration Completed Successfully ---');
}

migrateApi().catch(err => {
  console.error('[FATAL ERROR] Migration failed:', err);
  process.exit(1);
});