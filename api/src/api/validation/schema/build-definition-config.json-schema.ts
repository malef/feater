export const buildDefinitionConfigJsonSchema = {
    type: 'object',
    required: [
        'sources',
        'proxiedPorts',
        'composeFile',
        'environmentalVariables',
        'summaryItems',
    ],
    properties: {
        sources: {
            type: 'object',
            patternProperties: {
                '^[_a-zA-Z\\d]+$': {
                    required: [
                        'type',
                        'name',
                        'reference',
                        'beforeBuildTasks',
                    ],
                    properties: {
                        type: {
                            type: 'string',
                            minLegth: 1,
                        },
                        name: {
                            type: 'string',
                            minLegth: 1,
                        },
                        reference: {
                            type: 'object',
                            required: [
                                'type',
                                'name',
                            ],
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
                                required: [
                                    'type',
                                ],
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
                required: [
                    'id',
                    'serviceId',
                    'name',
                    'port',
                ],
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
                'envDirRelativePath',
                'composeFileRelativePaths',
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
                        minLength: 1
                    },
                },
            },
        },
        environmentalVariables: {
            type: 'object',
            patternProperties: {
                '^(?!FEAT__)[A-Z\\d_]+$': {
                    type: 'string',
                },
            },
            additionalProperties: false,
        },
        summaryItems: {
            type: 'array',
            items: {
                type: 'object',
                required: [
                    'name',
                    'value',
                    'asLink',
                ],
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
    },
    additionalProperties: false,
};
