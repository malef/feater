import {AbsolutePathsInterface} from '../helper/absolute-paths.interface';
import {InstantiationContextBeforeBuildTaskInterface} from './before-build/instantiation-context-before-build-task.interface';

export interface InstantiationContextSourceInterface {
    readonly id: string;
    readonly cloneUrl: string;
    readonly reference: {
        readonly type: string;
        readonly name: string;
    };
    readonly paths: {
        readonly dir: AbsolutePathsInterface,
    };
    readonly beforeBuildTasks: InstantiationContextBeforeBuildTaskInterface[];
}
