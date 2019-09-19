import {CommandLogTypeInterface} from './command-log-type.interface';

export interface ActionLogTypeInterface {
    readonly id: string;
    readonly actionId: string;
    readonly actionType: string;
    readonly createdAt: Date;
    readonly completedAt: Date;
    readonly failedAt: Date;
    readonly commandLogs: CommandLogTypeInterface[];
}
