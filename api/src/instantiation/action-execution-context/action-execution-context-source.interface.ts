import {AbsolutePathsInterface} from '../helper/absolute-paths.interface';
import {ActionExecutionContextBeforeBuildTaskInterface} from './before-build/action-execution-context-before-build-task.interface';

export interface ActionExecutionContextSourceInterface {
    readonly id: string;
    readonly cloneUrl: string;
    readonly reference: {
        readonly type: string;
        readonly name: string;
    };
    readonly paths: {
        readonly dir: AbsolutePathsInterface,
    };
    readonly beforeBuildTasks: ActionExecutionContextBeforeBuildTaskInterface[];
}
