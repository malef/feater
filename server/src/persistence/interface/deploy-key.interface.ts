import { Document } from 'mongoose';

export interface DeployKeyInterface extends Document {
    readonly _id: string;
    readonly cloneUrl: string;
    publicKey: string;
    privateKey: string;
    passphrase: string;
    createdAt: Date;
    updatedAt: Date;
}
