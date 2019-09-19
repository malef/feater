export interface InstantiationContextProxiedPortInterface {
    readonly id: string;
    readonly name: string;
    readonly serviceId: string;
    readonly port: number;
    domain?: string;
    nginxConfig?: string;
}
