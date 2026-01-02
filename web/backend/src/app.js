const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./core/error_handler');
const projectRoutes = require('./routes/projects');
const fileRoutes = require('./routes/files');
const buildRoutes = require('./routes/builds');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/builds', buildRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

module.exports = app;
