import { Document } from 'mongoose';

export interface AssetInterface extends Document {
    readonly _id: string;
    readonly id: string;
    readonly projectId: string;
    uploaded: boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
