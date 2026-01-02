require('dotenv').config();
const path = require('path');

module.exports = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    workspacePath: process.env.WORKSPACE_PATH || path.resolve(__dirname, '../../../workspace'),
    hostWorkspacePath: process.env.HOST_WORKSPACE_PATH || path.resolve(__dirname, '../../../workspace'),
    docker: {
        socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
    },
};
