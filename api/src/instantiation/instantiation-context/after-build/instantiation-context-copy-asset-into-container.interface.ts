import {InstantiationContextAfterBuildTaskInterface} from './instantiation-context-after-build-task.interface';

export interface InstantiationContextCopyAssetIntoContainerInterface extends InstantiationContextAfterBuildTaskInterface {
    readonly assetId: string;
    readonly serviceId: string;
    readonly destinationPath: string;
}
