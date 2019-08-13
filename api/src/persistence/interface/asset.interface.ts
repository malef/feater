import {Document} from 'mongoose';
import * as mongoose from 'mongoose';

export enum AssetVolumeStatus {
    creating = 'creating',
    ready = 'ready',
    failed = 'failed',
}

export interface AssetInterface extends Document {
    readonly _id: mongoose.Types.ObjectId;
    id: string;
    projectId: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    uploaded: boolean;
    mimeType?: string;
    volumeName?: string;
    volumeStatus?: string;
}
