import {InstantiationContextBeforeBuildTaskInterface} from '../../instantiation-context/before-build/instantiation-context-before-build-task.interface';
import {InstantiationContext} from '../../instantiation-context/instantiation-context';
import {InstantiationContextSourceInterface} from '../../instantiation-context/instantiation-context-source.interface';
import {CommandType} from '../../executor/command.type';

export interface BeforeBuildTaskCommandFactoryInterface {

    supportsType(type: string): boolean;

    createCommand(
        type: string,
        beforeBuildTask: InstantiationContextBeforeBuildTaskInterface,
        source: InstantiationContextSourceInterface,
        taskId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType;

}
