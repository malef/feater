import {Schema} from 'mongoose';

const InstanceServiceSchema = new Schema(
    {
        id: String,
        containerNamePrefix: String,
        containerId: String,
        ipAddress: String,
    }, {
        strict: true,
        _id: false,
    },
);

const InstanceEnvVariableSchema = new Schema(
    {
        name: String,
        value: String,
    }, {
        strict: true,
        _id: false,
    },
);

const InstanceProxiedPortSchema = new Schema(
    {
        serviceId: String,
        id: String,
        name: String,
        port: Number,
        domain: String,
        nginxConfig: String,
    }, {
        strict: true,
        _id: false,
    },
);

const InstanceSummaryItemSchema = new Schema(
    {
        name: String,
        value: String,
    }, {
        strict: true,
        _id: false,
    },
);

export const InstanceSchema = new Schema(
    {
        definitionId: String,
        name: String,
        hash: String,
        services: [InstanceServiceSchema],
        envVariables: [InstanceEnvVariableSchema],
        proxiedPorts: [InstanceProxiedPortSchema],
        summaryItems: [InstanceSummaryItemSchema],
        createdAt: Date,
        updatedAt: Date,
        completedAt: Date,
        failedAt: Date,
    }, {
        strict: true,
    },
);
