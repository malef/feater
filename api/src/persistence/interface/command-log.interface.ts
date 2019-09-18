import {Document} from 'mongoose';

export interface CommandLogDetailItemInterface {
    readonly name: string;
    value: string;
}

export interface CommandLogInterface extends Document {
    readonly _id: string;
    readonly taskId: string;
    readonly instanceId: string;
    readonly instanceHash: string;
    description: string;
    details: CommandLogDetailItemInterface[];
    createdAt: Date;
    updatedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
}
