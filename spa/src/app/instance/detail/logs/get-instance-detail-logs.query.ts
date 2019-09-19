import gql from 'graphql-tag';

export const getInstanceDetailLogsQueryGql = gql`
    query ($id: String!) {
        instance(id: $id) {
            id
            name
            actionLogs {
                id
                actionId
                actionType
                createdAt
                completedAt
                failedAt
                commandLogs {
                    id
                    description
                    createdAt
                    completedAt
                    failedAt
                    entries {
                        level
                        message
                    }
                }
            }
        }
    }
`;

export interface GetInstanceDetailLogsQueryInstanceFieldInterface {
    id: string;
    name: string;
    actionLogs: {
        id: string;
        actionId: string;
        actionType: string;
        createdAt: string;
        completedAt: string;
        failedAt: string;
        commandLogs: {
            id: string;
            description: string;
            createdAt: string;
            completedAt: string;
            failedAt: string;
            entries: {
                level: string;
                message: string;
            }[];
        }[];
    }[];
}

export interface GetInstanceDetailLogsQueryInterface {
    instance: GetInstanceDetailLogsQueryInstanceFieldInterface;
}
