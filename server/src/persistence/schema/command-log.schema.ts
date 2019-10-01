import { Schema } from 'mongoose';

export const CommandLogSchema = new Schema(
    {
        actionLogId: String,
        taskId: Schema.Types.Mixed, // TODO Remove later after migration is executed.
        instanceId: String, // TODO Remove if possible, can be retrieved from action log or replaced with log file path.
        instanceHash: String, // TODO Remove if possible, can be retrieved from action log or replaced with log file path.
        description: String,
        details: Schema.Types.Mixed, // TODO Remove later after migration is executed.
        createdAt: Date,
        updatedAt: Date,
        completedAt: Date,
        failedAt: Date,
    },
    {
        strict: true,
    },
);
