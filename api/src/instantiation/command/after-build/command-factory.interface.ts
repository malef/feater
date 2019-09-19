import {InstantiationContext} from '../../instantiation-context/instantiation-context';
import {InstantiationContextAfterBuildTaskInterface} from '../../instantiation-context/after-build/instantiation-context-after-build-task.interface';
import {CommandType} from '../../executor/command.type';

export interface AfterBuildTaskCommandFactoryInterface {

    supportsType(type: string): boolean;

    createCommand(
        type: string,
        afterBuildTask: InstantiationContextAfterBuildTaskInterface,
        taskId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType;

}
