import {Document} from 'mongoose';

export interface InstanceServiceInterface {
    id: string;
    containerNamePrefix: string;
    containerId?: string;
    ipAddress?: string;
}

export interface InstanceDownloadableInterface {
    id: string;
    name: string;
    serviceId: string;
    absolutePath: string;
}

export interface InstanceInterface extends Document {
    readonly _id: string;
    definitionId: string;
    instantiationActionId: string;
    name: string;
    hash: string;
    services: InstanceServiceInterface[];
    summaryItems: {
        name: string;
        value: string;
    }[];
    envVariables: {
        name: string;
        value: string;
    }[];
    proxiedPorts: {
        id: string;
        name: string;
        serviceId: string;
        port: number;
        domain?: string;
        nginxConfig?: string;
    }[];
    downloadables: InstanceDownloadableInterface[];
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;
    failedAt: Date;
}
