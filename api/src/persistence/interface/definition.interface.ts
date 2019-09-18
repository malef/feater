import {Document} from 'mongoose';

export interface DefinitionInterface extends Document {
    readonly _id: string;
    readonly projectId: string;
    name: string;
    config: any; // TODO Add interface for this.
    createdAt: Date;
    updatedAt: Date;
}
