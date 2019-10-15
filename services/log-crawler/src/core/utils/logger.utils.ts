import log4js from 'log4js';
import { LogCrawlerError, ErrorCode } from '@home/error';

export namespace Logger {
    let isInitialized = false;
    let logDebug: log4js.Logger;
    let logTrace: log4js.Logger;
    let logInfo: log4js.Logger;
    let logError: log4js.Logger;
    let logger: log4js.Logger;

    export const init = (): void => {
        const config: log4js.Configuration = {
            appenders: {
                debugLog: { type: 'file', filename: 'log/debug.log' },
                console: { type: 'console' }
            },
            categories: {
                prd: { appenders: ['console'], level: 'trace' },
                dev: { appenders: ['debugLog', 'console'], level: 'trace' },
                testing: { appenders: ['debugLog', 'console'], level: 'trace' },
                default: { appenders: ['console'], level: 'trace'}
            }
        };
        log4js.configure(config);
        switch (process.env.NODE_ENV) {
            case 'dev': logger = log4js.getLogger('dev'); break;
            case 'prd': logger = log4js.getLogger('prd'); break;
            case 'testing': logger = log4js.getLogger('testing'); break;
            default: logger = log4js.getLogger();
        }
        isInitialized = true;
    };

    const checkInitialized = () => {
        if (!isInitialized) {
            throw new LogCrawlerError('Logger not initialized', ErrorCode.LOGGER_NOT_INITIALIZED);
        }
    };

    export const debug = (...message: string[]): void => {
        checkInitialized();
        logger.debug(message);
    };

    export const trace = (...message: string[]): void => {
        checkInitialized();
        logger.trace(message);
    };

    export const info = (...message: string[]): void => {
        checkInitialized();
        logger.info(message);
    };

    export const error = (...message: string[]): void => {
        checkInitialized();
        logger.error(message);
    };

    export const warn = (...message: string[]): void => {
        checkInitialized();
        logger.warn(message);
    };

    export const getExpressLogger = () => {
        return log4js.connectLogger(logger, { level: 'info'});
    };
}
