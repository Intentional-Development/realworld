import { spawn } from 'node:child_process';
import http from 'node:http';

console.log('Installing dependencies...');
const install = spawn('npm', ['install'], { stdio: 'inherit', shell: true });

install.on('close', (code) => {
  if (code !== 0) {
    console.error('npm install failed');
    process.exit(1);
  }

  console.log('Building SPA...');
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });

  build.on('close', (buildCode) => {
    if (buildCode !== 0) {
      console.error('npm run build failed');
      process.exit(1);
    }

    console.log('Starting preview server...');
    const preview = spawn('npm', ['run', 'preview', '--', '--port', '4101'], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    let serverReady = false;
    const timeout = setTimeout(() => {
      if (!serverReady) {
        console.error('Preview server did not start in time');
        preview.kill();
        process.exit(1);
      }
    }, 30000);

    preview.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      if (output.includes('Local:') || output.includes('localhost')) {
        serverReady = true;
        clearTimeout(timeout);
        
        // Wait a moment for server to fully initialize
        setTimeout(() => {
          console.log('Testing health endpoint...');
          const req = http.get('http://localhost:4101/', (res) => {
            console.log(`Health check status: ${res.statusCode}`);
            if (res.statusCode === 200) {
              console.log('✓ Acceptance test passed');
              preview.kill();
              process.exit(0);
            } else {
              console.error('✗ Acceptance test failed: unexpected status code');
              preview.kill();
              process.exit(1);
            }
          });

          req.on('error', (err) => {
            console.error(`✗ Acceptance test failed: ${err.message}`);
            preview.kill();
            process.exit(1);
          });
        }, 2000);
      }
    });

    preview.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    preview.on('error', (err) => {
      console.error(`Failed to start preview: ${err.message}`);
      process.exit(1);
    });
  });
});
