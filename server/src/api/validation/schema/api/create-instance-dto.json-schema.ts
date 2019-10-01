export const createInstanceDtoJsonSchema = {
    type: 'object',
    required: ['definitionId', 'hash', 'name'],
    properties: {
        definitionId: {
            type: 'string',
            pattern: '^[a-f\\d]{24}$',
        },
        hash: {
            type: 'string',
            minLength: 1,
        },
        name: {
            type: 'string',
            minLength: 1,
        },
    },
    additionalProperties: false,
};
