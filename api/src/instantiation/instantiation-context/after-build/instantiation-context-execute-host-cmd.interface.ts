import {InstantiationContextAfterBuildTaskInterface} from './instantiation-context-after-build-task.interface';
import {InheritedEnvVariableInterface} from '../../command/after-build/inherited-env-variable.interface';
import {CustomEnvVariableInterface} from '../../command/after-build/custom-env-variable.interface';

export interface InstantiationContextExecuteHostCmdInterface extends InstantiationContextAfterBuildTaskInterface {
    readonly customEnvVariables: CustomEnvVariableInterface[];
    readonly inheritedEnvVariables: InheritedEnvVariableInterface[];
    readonly command: string[];
    readonly absoluteGuestInstancePath: string;
}
