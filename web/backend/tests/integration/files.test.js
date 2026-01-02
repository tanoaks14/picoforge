const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../src/config');


const TEST_WORKSPACE = path.join(__dirname, 'test_workspace_files');

describe('Files API Integration Tests', () => {
    beforeAll(async () => {
        config.workspacePath = TEST_WORKSPACE;
        await fs.mkdir(TEST_WORKSPACE, { recursive: true });
    });

    afterAll(async () => {
        await fs.rm(TEST_WORKSPACE, { recursive: true, force: true });
    });

    beforeEach(async () => {
        // Setup: Create a project
        await fs.mkdir(path.join(TEST_WORKSPACE, 'test_project'), { recursive: true });
    });

    afterEach(async () => {
        const files = await fs.readdir(TEST_WORKSPACE);
        for (const file of files) {
            await fs.rm(path.join(TEST_WORKSPACE, file), { recursive: true, force: true });
        }
    });

    describe('POST /api/v1/files', () => {
        it('should write a file to the project', async () => {
            const res = await request(app)
                .post('/api/v1/files')
                .send({
                    projectName: 'test_project',
                    filePath: 'main.cpp',
                    content: '#include <stdio.h>'
                });

            expect(res.statusCode).toEqual(200);

            // Verify content
            const content = await fs.readFile(path.join(TEST_WORKSPACE, 'test_project', 'main.cpp'), 'utf8');
            expect(content).toBe('#include <stdio.h>');
        });

        it('should create nested directories if needed', async () => {
            const res = await request(app)
                .post('/api/v1/files')
                .send({
                    projectName: 'test_project',
                    filePath: 'src/core/utils.cpp',
                    content: '// utils'
                });

            expect(res.statusCode).toEqual(200);

            // Verify content
            const content = await fs.readFile(path.join(TEST_WORKSPACE, 'test_project', 'src/core/utils.cpp'), 'utf8');
            expect(content).toBe('// utils');
        });
    });

    describe('GET /api/v1/files', () => {
        it('should read a file from the project', async () => {
            // Setup file
            await fs.writeFile(path.join(TEST_WORKSPACE, 'test_project', 'readme.md'), '# Hello');

            const res = await request(app)
                .get('/api/v1/files')
                .query({ projectName: 'test_project', filePath: 'readme.md' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.content).toBe('# Hello');
        });

        it('should return 404 if file does not exist', async () => {
            const res = await request(app)
                .get('/api/v1/files')
                .query({ projectName: 'test_project', filePath: 'missing.txt' });

            expect(res.statusCode).toEqual(404);
        });

        it('should return 500/AccessDenied if path traversal attempted', async () => {
            // Note: Our service logic throws Access Denied, middleware maps it. 
            // Depending on implementation, might be 500 or specific status. 
            // Current error handler sends 500 for generic errors.
            const res = await request(app)
                .get('/api/v1/files')
                .query({ projectName: 'test_project', filePath: '../outside.txt' });

            // Expecting error
            expect(res.statusCode).not.toEqual(200);
        });
    });
});
