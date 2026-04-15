import fs from 'fs/promises';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), '.backup_replit/artifacts/living-canvas/src');
const DEST_DIR = path.join(process.cwd(), 'src');

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
        console.log(`Copied: ${destPath}`);
      }
    }
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}:`, err);
  }
}

async function migrateApp() {
  console.log('Starting migration from Living Canvas to Next.js...');
  
  // Folders to copy
  const folders = ['components', 'data', 'hooks', 'lib', 'store'];
  
  for (const folder of folders) {
    await copyDir(path.join(SRC_DIR, folder), path.join(DEST_DIR, folder));
  }

  // Copy types
  await fs.copyFile(path.join(SRC_DIR, 'types.ts'), path.join(DEST_DIR, 'types.ts'));
  console.log('Copied: src/types.ts');

  // Convert App.tsx to Next.js page.tsx
  const appTsx = await fs.readFile(path.join(SRC_DIR, 'App.tsx'), 'utf-8');
  const pageTsx = `"use client";\n\n` + appTsx.replace('export default function App', 'export default function Page');
  await fs.writeFile(path.join(DEST_DIR, 'app/page.tsx'), pageTsx);
  console.log('Migrated App.tsx to src/app/page.tsx');

  // Add globals.css updates
  const oldCss = await fs.readFile(path.join(SRC_DIR, 'index.css'), 'utf-8');
  await fs.appendFile(path.join(DEST_DIR, 'app/globals.css'), `\n/* Migrated from Living Canvas index.css */\n` + oldCss);
  console.log('Appended index.css to src/app/globals.css');

  console.log('Migration completed successfully!');
}

migrateApp().catch(console.error);