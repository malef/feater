import gql from 'graphql-tag';

export const getDefinitionQueryGql = gql`
    query($id: String!) {
        definition(id: $id) {
            id
            name
            config {
                actions {
                    id
                    name
                    type
                }
            }
        }
    }
`;

export interface GetDefinitionQueryDefinitionFieldInterface {
    id: string;
    name: string;
    config: {
        actions: {
            id: string;
            name: string;
            type: string;
        }[];
    };
}

export interface GetDefinitionQueryInterface {
    definition: GetDefinitionQueryDefinitionFieldInterface;
}
