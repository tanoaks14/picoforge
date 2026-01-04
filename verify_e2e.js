const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:3000/api/v1';
const PROJECT_NAME = 'e2e_test_project';
const WORKSPACE_DIR = path.join(__dirname, 'workspace');

async function run() {
    console.log('[E2E] Starting Verification...');

    
    console.log(`[E2E] Creating project: ${PROJECT_NAME}...`);
    const createRes = await fetch(`${BACKEND_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: PROJECT_NAME,
            modules: ['adc', 'pwm'],
            build_options: { timeout: 60 }
        })
    });

    if (!createRes.ok) {
        const txt = await createRes.text();
        
        if (!txt.includes('already exists')) {
            throw new Error(`Failed to create project: ${createRes.status} ${txt}`);
        } else {
            console.log('[E2E] Project already exists, continuing...');
        }
    } else {
        console.log('[E2E] Project created.');
    }

    
    console.log('[E2E] Triggering build...');
    const buildRes = await fetch(`${BACKEND_URL}/builds/${PROJECT_NAME}`, {
        method: 'POST'
    });

    if (!buildRes.ok) {
        const txt = await buildRes.text();
        throw new Error(`Failed to trigger build: ${buildRes.status} ${txt}`);
    }

    console.log('[E2E] Build triggered. Streaming logs...');

    
    const reader = buildRes.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    const logPath = path.join(__dirname, 'build.log');
    const logStream = fs.createWriteStream(logPath);

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
            const chunk = decoder.decode(value);
            console.log(chunk); 
            logStream.write(chunk);
        }
    }
    logStream.end();
    console.log('[E2E] Build stream ended. Log saved to build.log');

    
    
    const artifactPath = path.join(WORKSPACE_DIR, PROJECT_NAME, 'build', `${PROJECT_NAME}.uf2`);

    console.log(`[E2E] Checking for artifact at: ${artifactPath}`);

    
    await new Promise(r => setTimeout(r, 1000));

    if (fs.existsSync(artifactPath)) {
        const stats = fs.statSync(artifactPath);
        console.log(`[E2E] SUCCESS! Artifact found.`);
        console.log(`[E2E] Size: ${stats.size} bytes`);
        console.log(`[E2E] Created: ${stats.birthtime}`);
    } else {
        console.error(`[E2E] FAILURE! Artifact NOT found.`);
        process.exit(1);
    }
}

run().catch(err => {
    console.error('[E2E] Error:', err);
    process.exit(1);
});
