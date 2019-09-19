import {InstantiationContextBeforeBuildTaskInterface} from './instantiation-context-before-build-task.interface';

export interface InstantiationContextInterpolateFileInterface extends InstantiationContextBeforeBuildTaskInterface {
    readonly type: string;
    readonly relativePath: string;
    interpolatedText?: string;
}
