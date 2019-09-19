export interface InstantiationContextServiceInterface {
    readonly id: string;
    readonly containerNamePrefix: string;
    containerId?: string;
    ipAddress?: string;
}
