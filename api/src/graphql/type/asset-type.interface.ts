export interface AssetTypeInterface {
    readonly id: string;
    readonly projectId: string;
    readonly description: string;
    readonly mimeType: string;
    readonly volumeName: string;
    readonly volumeStatus: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
