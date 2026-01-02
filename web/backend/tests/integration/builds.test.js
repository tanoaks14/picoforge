const request = require('supertest');
const app = require('../../src/app');
const dockerService = require('../../src/services/docker_service');
// Mock the docker service methods BEFORE app uses them? 
// No, Jest mocks need to be properly intercepted. 
// Since we import app -> routes -> controllers -> services -> docker_service singleton,
// we can spyOn/mock implementations on the singleton instance directly.

describe('Builds API Integration Tests', () => {

    describe('POST /api/v1/builds/:projectName', () => {
        let runBuildSpy;

        beforeAll(() => {
            // Mock the dockerService.runBuild method
            runBuildSpy = jest.spyOn(dockerService, 'runBuild').mockImplementation(async () => {
                // Return a mock stream
                const { PassThrough } = require('stream');
                const mockStream = new PassThrough();
                mockStream.write('Build started...\n');
                mockStream.write('Build finished.\n');
                mockStream.end();
                return {
                    container: { id: 'mock-container' },
                    stream: mockStream
                };
            });
        });

        afterAll(() => {
            runBuildSpy.mockRestore();
        });

        it('should trigger a docker build and stream logs', async () => {
            const res = await request(app)
                .post('/api/v1/builds/my_project')
                .expect('Content-Type', /text\/plain/);

            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('Build started...');
            expect(res.text).toContain('Build finished.');

            expect(runBuildSpy).toHaveBeenCalled();
            // Verify arguments passed to runBuild
            const [image, cmd, binds] = runBuildSpy.mock.calls[0];
            expect(image).toBe('picoforge:latest');
            expect(binds[0]).toMatch(/my_project:\/app\/workspace\/my_project/);
        });
    });
});
