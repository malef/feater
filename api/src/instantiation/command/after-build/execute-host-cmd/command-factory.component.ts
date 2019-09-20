import {AfterBuildTaskCommandFactoryInterface} from '../command-factory.interface';
import {ExecuteHostCmdCommand} from './command';
import {ActionExecutionContextAfterBuildTaskInterface} from '../../../action-execution-context/after-build/action-execution-context-after-build-task.interface';
import {ActionExecutionContext} from '../../../action-execution-context/action-execution-context';
import {ActionExecutionContextExecuteHostCmdInterface} from '../../../action-execution-context/after-build/action-execution-context-execute-host-cmd.interface';
import {ContextAwareCommand} from '../../../executor/context-aware-command';
import {EnvVariablesSet} from '../../../sets/env-variables-set';
import {CommandType} from '../../../executor/command.type';
import {Injectable} from '@nestjs/common';

@Injectable()
export class ExecuteHostCmdCommandFactoryComponent implements AfterBuildTaskCommandFactoryInterface {

    protected readonly TYPE = 'executeHostCommand';

    supportsType(type: string): boolean {
        return this.TYPE === type;
    }

    createCommand(
        type: string,
        afterBuildTask: ActionExecutionContextAfterBuildTaskInterface,
        actionLogId: string,
        instantiationContext: ActionExecutionContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        const typedAfterBuildTask = afterBuildTask as ActionExecutionContextExecuteHostCmdInterface;

        return new ContextAwareCommand(
            actionLogId,
            instantiationContext.id,
            instantiationContext.hash,
            `Execute host command`,
            () => new ExecuteHostCmdCommand(
                instantiationContext.envVariables,
                EnvVariablesSet.fromList(typedAfterBuildTask.customEnvVariables),
                typedAfterBuildTask.inheritedEnvVariables,
                typedAfterBuildTask.command,
                instantiationContext.paths.dir.absolute.guest,
            ),
        );
    }

}
