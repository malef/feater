import {ActionExecutionContextBeforeBuildTaskInterface} from '../../action-execution-context/before-build/action-execution-context-before-build-task.interface';
import {ActionExecutionContext} from '../../action-execution-context/action-execution-context';
import {ActionExecutionContextSourceInterface} from '../../action-execution-context/action-execution-context-source.interface';
import {CommandType} from '../../executor/command.type';

export interface BeforeBuildTaskCommandFactoryInterface {

    supportsType(type: string): boolean;

    createCommand(
        type: string,
        beforeBuildTask: ActionExecutionContextBeforeBuildTaskInterface,
        source: ActionExecutionContextSourceInterface,
        actionLogId: string,
        instantiationContext: ActionExecutionContext,
        updateInstance: () => Promise<void>,
    ): CommandType;

}
