import {AfterBuildTaskCommandFactoryInterface} from '../command-factory.interface';
import {ExecuteServiceCmdCommand} from './command';
import {InstantiationContextAfterBuildTaskInterface} from '../../../instantiation-context/after-build/instantiation-context-after-build-task.interface';
import {InstantiationContext} from '../../../instantiation-context/instantiation-context';
import {InstantiationContextExecuteServiceCmdInterface} from '../../../instantiation-context/after-build/instantiation-context-execute-service-cmd.interface';
import {ContextAwareCommand} from '../../../executor/context-aware-command';
import {EnvVariablesSet} from '../../../sets/env-variables-set';
import {CommandType} from '../../../executor/command.type';
import {Injectable} from '@nestjs/common';

@Injectable()
export class ExecuteServiceCmdCommandFactoryComponent implements AfterBuildTaskCommandFactoryInterface {

    protected readonly TYPE = 'executeServiceCommand';

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
        const typedAfterBuildTask = afterBuildTask as InstantiationContextExecuteServiceCmdInterface;

        return new ContextAwareCommand(
            actionLogId,
            instantiationContext.id,
            instantiationContext.hash,
            `Execute service command for service \`${typedAfterBuildTask.serviceId}\``,
            () => {
                const service = instantiationContext.findService(typedAfterBuildTask.serviceId);

                return new ExecuteServiceCmdCommand(
                    instantiationContext.envVariables,
                    EnvVariablesSet.fromList(typedAfterBuildTask.customEnvVariables),
                    typedAfterBuildTask.inheritedEnvVariables,
                    service.containerId,
                    typedAfterBuildTask.command,
                    instantiationContext.paths.dir.absolute.guest,
                );
            },
        );
    }

}
