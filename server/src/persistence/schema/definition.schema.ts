import { Schema } from 'mongoose';

export const DefinitionSchema = new Schema(
    {
        projectId: String,
        name: String,
        config: Schema.Types.Mixed,
        createdAt: Date,
        updatedAt: Date,
    },
    {
        strict: true,
    },
);
