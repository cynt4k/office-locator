import { ErrorCode } from '@home/error';

export class LogCrawlerError extends Error {
    private code?: ErrorCode;

    constructor(message: string, code?: ErrorCode) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public getCode(): ErrorCode | undefined {
        return this.code;
    }
}
