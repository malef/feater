export const definitionConfigJsonSchema = {
    type: 'object',
    required: [
        'sources',
        'proxiedPorts',
        'composeFile',
        'envVariables',
        'summaryItems',
        'downloadables',
    ],
    properties: {
        sources: {
            type: 'object',
            patternProperties: {
                '^[_a-zA-Z\\d]+$': {
                    required: ['cloneUrl', 'reference', 'beforeBuildTasks'],
                    properties: {
                        cloneUrl: {
                            type: 'string',
                            minLegth: 1,
                        },
                        reference: {
                            type: 'object',
                            required: ['type', 'name'],
                            properties: {
                                type: {
                                    type: 'string',
                                    minLength: 1,
                                },
                                name: {
                                    type: 'string',
                                    minLength: 1,
                                },
                            },
                        },
                        beforeBuildTasks: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['type'],
                                properties: {
                                    type: {
                                        type: 'string',
                                        minLength: 1,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            additionalProperties: false,
        },
        proxiedPorts: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'serviceId', 'name', 'port'],
                properties: {
                    id: {
                        type: 'string',
                        minLength: 1,
                    },
                    serviced: {
                        type: 'string',
                        minLength: 1,
                    },
                    name: {
                        type: 'string',
                        minLength: 1,
                    },
                    port: {
                        type: 'number',
                    },
                },
                additionalProperties: false,
            },
        },
        composeFile: {
            type: 'object',
            required: [
                'sourceId',
                'relativeEnvDirPath',
                'relativeComposeFilePaths',
            ],
            properties: {
                sourceId: {
                    type: 'string',
                    minLength: 1,
                },
                envDirRelativePath: {
                    type: 'string',
                    minLength: 1,
                },
                composeFileRelativePaths: {
                    type: 'array',
                    items: {
                        type: 'string',
                        minLength: 1,
                    },
                },
            },
        },
        envVariables: {
            type: 'object',
            patternProperties: {
                '^(?!FEATER__)[A-Z\\d_]+$': {
                    type: 'string',
                },
            },
            additionalProperties: false,
        },
        summaryItems: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name', 'value', 'asLink'],
                properties: {
                    name: {
                        type: 'string',
                        minLength: 1,
                    },
                    value: {
                        type: 'string',
                        minLength: 1,
                    },
                    asLink: {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        },
        downloadables: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'name', 'serviceId', 'absolutePath'],
                properties: {
                    id: {
                        type: 'string',
                        minLength: 1,
                    },
                    name: {
                        type: 'string',
                        minLength: 1,
                    },
                    serviceId: {
                        type: 'string',
                        minLength: 1,
                    },
                    absolutePath: {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        },
    },
    additionalProperties: false,
};
