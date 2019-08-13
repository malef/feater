import gql from 'graphql-tag';


export const getAssetListQueryGql = gql`
    query {
        assets {
            id
            mimeType
            volumeName
            volumeStatus
            createdAt
            updatedAt
        }
    }
`;

export interface GetAssetListQueryAssetsFieldItemInterface {
    id: number;
    mimeType: string;
    volumeName: string;
    volumeStatus: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetAssetListQueryInterface {
    assets: GetAssetListQueryAssetsFieldItemInterface[];
}
