import {Schema} from 'mongoose';

export const AssetSchema = new Schema({
    projectId: String,
    id: String,
    description: String,
    uploaded: Boolean,
    mimeType: String,
    createdAt: Date,
    updatedAt: Date,
    volumeName: String,
    volumeStatus: String,
});
