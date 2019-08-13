export interface EnvironmentInterface {
    readonly app: {
        readonly versionNumber: string;
    };
    readonly mongo: {
        readonly dsn: string;
    };
    readonly guestPaths: {
        readonly root: string;
        readonly build: string;
        readonly proxyDomain: string;
        readonly asset: string;
    };
    readonly hostPaths: {
        readonly build: string;
        readonly asset: string;
    };
    readonly instantiation: {
        readonly composeBinaryPath: string;
        readonly composeHttpTimeout: number;
        readonly dockerBinaryPath: string;
        readonly containerNamePrefix: string; // TODO Rename to composeProjectNamePrefix.
        readonly assetVolumeNamePrefix: string;
        readonly proxyDomainPattern: string;
        readonly proxyDomainsNetworkName: string;
        readonly gzipBinaryPath: string;
        readonly tarBinaryPath: string;
        readonly catBinaryPath: string;
    };
    readonly logger: {
        readonly console: {
            readonly logLevel: string;
        };
        readonly mongoDb: {
            readonly logLevel: string;
        }
    };
}
