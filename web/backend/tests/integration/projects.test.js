const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../src/config');

const TEST_WORKSPACE = path.join(__dirname, 'test_workspace_projects');

describe('Projects API Integration Tests', () => {
    beforeAll(async () => {
        
        
        config.workspacePath = TEST_WORKSPACE;
        await fs.mkdir(TEST_WORKSPACE, { recursive: true });
    });

    afterAll(async () => {
        
        await fs.rm(TEST_WORKSPACE, { recursive: true, force: true });
    });

    afterEach(async () => {
        
        
        try {
            const files = await fs.readdir(TEST_WORKSPACE);
            for (const file of files) {
                await fs.rm(path.join(TEST_WORKSPACE, file), { recursive: true, force: true });
            }
        } catch (e) {
            
        }
    });

    describe('GET /api/v1/projects', () => {
        it('should return an empty list initially', async () => {
            const res = await request(app).get('/api/v1/projects');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([]);
        });

        it('should return a list of projects', async () => {
            await fs.mkdir(path.join(TEST_WORKSPACE, 'project1'));
            await fs.mkdir(path.join(TEST_WORKSPACE, 'project2'));

            const res = await request(app).get('/api/v1/projects');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(2);
            expect(res.body.map(p => p.name).sort()).toEqual(['project1', 'project2']);
        });
    });

    describe('POST /api/v1/projects', () => {
        it('should create a new project', async () => {
            const res = await request(app)
                .post('/api/v1/projects')
                .send({ name: 'new_project' });

            expect(res.statusCode).toEqual(201);
            expect(res.body.name).toBe('new_project');

            
            const stats = await fs.stat(path.join(TEST_WORKSPACE, 'new_project'));
            expect(stats.isDirectory()).toBe(true);
        });

        it('should return 400 for invalid project name', async () => {
            const res = await request(app)
                .post('/api/v1/projects')
                .send({ name: 'invalid name/with/slash' });

            expect(res.statusCode).toEqual(400);
        });

        it('should return 409 if project already exists', async () => {
            await fs.mkdir(path.join(TEST_WORKSPACE, 'existing_project'));

            const res = await request(app)
                .post('/api/v1/projects')
                .send({ name: 'existing_project' });

            expect(res.statusCode).toEqual(409);
        });
    });
});
