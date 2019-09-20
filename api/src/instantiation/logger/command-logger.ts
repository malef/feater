import {ActionLogInterface} from '../../persistence/interface/action-log.interface';
import {CommandLogInterface} from '../../persistence/interface/command-log.interface';
import {environment} from '../../environments/environment';
import * as winston from 'winston';

export class CommandLogger {

    private readonly logger: winston.Logger;

    constructor(
        private readonly commandLog: CommandLogInterface,
        absoluteGuestCommandLogPath: string,
    ) {
        this.logger = winston.createLogger({
            exitOnError: false,
            transports: [
                new winston.transports.File({
                    level: environment.logger.mongoDb.logLevel,
                    filename: absoluteGuestCommandLogPath,
                }),
            ],
        });
    }

    emerg(message: string, meta: object = {}) {
        this.logger.emerg(message, this.getMeta());
    }

    alert(message: string, meta: object = {}) {
        this.logger.alert(message, this.getMeta());
    }

    crit(message: string, meta: object = {}) {
        this.logger.crit(message, this.getMeta());
    }

    error(message: string, meta: object = {}) {
        this.logger.error(message, this.getMeta());
    }

    warning(message: string, meta: object = {}) {
        this.logger.warning(message, this.getMeta());
    }

    notice(message: string, meta: object = {}) {
        this.logger.notice(message, this.getMeta());
    }

    info(message: string, meta: object = {}) {
        this.logger.info(message, this.getMeta());
    }

    debug(message: string, meta: object = {}) {
        this.logger.debug(message, this.getMeta());
    }

    async markAsCompleted(): Promise<void> {
        this.commandLog.completedAt = new Date();
        await this.commandLog.save();
    }

    async markAsFailed(): Promise<void> {
        this.commandLog.failedAt = new Date();
        await this.commandLog.save();
    }

    private getMeta(): any {
        return {};
    }

}
