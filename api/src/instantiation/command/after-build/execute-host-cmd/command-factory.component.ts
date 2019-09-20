import {AfterBuildTaskCommandFactoryInterface} from '../command-factory.interface';
import {ExecuteHostCmdCommand} from './command';
import {InstantiationContextAfterBuildTaskInterface} from '../../../instantiation-context/after-build/instantiation-context-after-build-task.interface';
import {InstantiationContext} from '../../../instantiation-context/instantiation-context';
import {InstantiationContextExecuteHostCmdInterface} from '../../../instantiation-context/after-build/instantiation-context-execute-host-cmd.interface';
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
        afterBuildTask: InstantiationContextAfterBuildTaskInterface,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        const typedAfterBuildTask = afterBuildTask as InstantiationContextExecuteHostCmdInterface;

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
