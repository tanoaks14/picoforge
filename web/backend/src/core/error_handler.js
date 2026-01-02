const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};

module.exports = errorHandler;
