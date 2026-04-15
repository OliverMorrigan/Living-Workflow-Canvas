import fs from 'fs/promises';
import path from 'path';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');

/**
 * Utility to walk directories recursively
 */
async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

async function validateAndFix() {
  console.log('--- [BUILDER PROCESS] Starting Robust Validation & Fixes ---');
  
  let filesChecked = 0;
  let filesFixed = 0;
  const filesToRemove = [];

  for await (const filePath of walk(SRC_DIR)) {
    filesChecked++;
    const fileName = path.basename(filePath);
    
    // 1. Remove unnecessary nested config files that might confuse Next.js/TypeScript
    if (['package.json', 'tsconfig.json', 'tsconfig.tsbuildinfo', 'drizzle.config.ts'].includes(fileName)) {
      filesToRemove.push(filePath);
      continue;
    }

    // 2. Fix imports in TS/TSX files
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      let content = await fs.readFile(filePath, 'utf-8');
      let changed = false;

      // Example fix: If there are any residual @workspace imports, map them to @/lib
      if (content.includes('@workspace/db')) {
        content = content.replace(/@workspace\/db/g, '@/lib/db');
        changed = true;
      }
      if (content.includes('@workspace/api-client-react')) {
        content = content.replace(/@workspace\/api-client-react/g, '@/lib/api-client-react');
        changed = true;
      }
      if (content.includes('@workspace/api-zod')) {
        content = content.replace(/@workspace\/api-zod/g, '@/lib/api-zod');
        changed = true;
      }

      if (changed) {
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`[FIXED] Imports in ${path.relative(ROOT_DIR, filePath)}`);
        filesFixed++;
      }
    }
  }

  // Execute removals
  for (const fileToRemove of filesToRemove) {
    try {
      await fs.unlink(fileToRemove);
      console.log(`[CLEANED] Removed nested config file: ${path.relative(ROOT_DIR, fileToRemove)}`);
    } catch (e) {
      console.error(`[ERROR] Could not remove ${fileToRemove}:`, e.message);
    }
  }

  console.log(`\n--- [BUILDER METRICS] ---`);
  console.log(`Files scanned: ${filesChecked}`);
  console.log(`Files modified: ${filesFixed}`);
  console.log(`Files cleaned: ${filesToRemove.length}`);
  console.log('---------------------------\n');
}

validateAndFix().catch(err => {
  console.error('[FATAL ERROR] Validation script failed:', err);
  process.exit(1);
});