import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const logFile = path.join(process.cwd(), 'build-metrics.log');

async function runBuild() {
  console.log('[BUILDER] Starting optimized Next.js build verification...');
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const child = exec('pnpm build', { env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
    
    let output = '';
    
    child.stdout.on('data', data => {
      output += data;
    });
    
    child.stderr.on('data', data => {
      output += data;
    });

    child.on('close', async (code) => {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      const metrics = `
=========================================
[BUILDER METRICS & LOGS]
=========================================
Build Execution Time: ${duration} seconds
Exit Code: ${code}
Memory Usage Estimate: ~${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
Status: ${code === 0 ? 'SUCCESS' : 'FAILED'}
=========================================

[BUILD OUTPUT]
${output}
`;

      await fs.writeFile(logFile, metrics, 'utf-8');
      
      if (code === 0) {
        console.log(`[SUCCESS] Build verified in ${duration}s. Logs saved to build-metrics.log`);
        resolve();
      } else {
        console.log(`[ERROR] Build failed after ${duration}s. See build-metrics.log for details.`);
        resolve(); // resolve instead of reject to keep the process alive to read the logs
      }
    });
  });
}

runBuild();