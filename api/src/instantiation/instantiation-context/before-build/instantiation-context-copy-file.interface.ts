import {InstantiationContextBeforeBuildTaskInterface} from './instantiation-context-before-build-task.interface';

export interface InstantiationContextCopyFileInterface extends InstantiationContextBeforeBuildTaskInterface {
    readonly type: string;
    readonly sourceRelativePath: string;
    readonly destinationRelativePath: string;
}
