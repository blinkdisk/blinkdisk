import logger from "electron-log/main";

logger.initialize();

logger.errorHandler.startCatching();
logger.eventLogger.startLogging();

export const log = logger;
