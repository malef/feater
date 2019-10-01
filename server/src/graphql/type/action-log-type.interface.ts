import { CommandLogTypeInterface } from './command-log-type.interface';

export interface ActionLogTypeInterface {
    id: string;
    actionId: string;
    actionType: string;
    actionName: string;
    createdAt: Date;
    completedAt?: Date;
    failedAt?: Date;
    commandLogs: CommandLogTypeInterface[];
}
