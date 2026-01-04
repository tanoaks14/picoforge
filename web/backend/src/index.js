const app = require('./app');
const logger = require('./core/logger');
const config = require('./config');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
