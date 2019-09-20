import {Injectable} from '@nestjs/common';
import {BaseLogger} from '../logger/base-logger';
import {CommandsList} from './executor/commands-list';
import {ContextAwareCommand} from './executor/context-aware-command';
import {ResetSourceCommand} from './command/reset-source/command';
import {CopyFileCommandFactoryComponent} from './command/before-build/copy-file/command-factory.component';
import {InterpolateFileCommandFactoryComponent} from './command/before-build/interpolate-file/command-factory.component';
import {BeforeBuildTaskCommandFactoryInterface} from './command/before-build/command-factory.interface';
import {CopyAssetIntoContainerCommandFactoryComponent} from './command/after-build/copy-asset-into-container/command-factory.component';
import {ExecuteHostCmdCommandFactoryComponent} from './command/after-build/execute-host-cmd/command-factory.component';
import {ExecuteServiceCmdCommandFactoryComponent} from './command/after-build/execute-service-cmd/command-factory.component';
import {AfterBuildTaskCommandFactoryInterface} from './command/after-build/command-factory.interface';
import {CommandExecutorComponent} from './executor/command-executor.component';
import {InstantiationContextSourceInterface} from './instantiation-context/instantiation-context-source.interface';
import {InstantiationContextAfterBuildTaskInterface} from './instantiation-context/after-build/instantiation-context-after-build-task.interface';
import {InstantiationContextBeforeBuildTaskInterface} from './instantiation-context/before-build/instantiation-context-before-build-task.interface';
import {InstantiationContext} from './instantiation-context/instantiation-context';
import {InstantiationContextFactory} from './instantiation-context-factory.service';
import {CommandType} from './executor/command.type';
import {CommandsMap} from './executor/commands-map';
import {CommandsMapItem} from './executor/commands-map-item';
import {InstanceInterface} from '../persistence/interface/instance.interface';
import {DefinitionInterface} from '../persistence/interface/definition.interface';
import {InstanceRepository} from '../persistence/repository/instance.repository';
import {ActionLogRepository} from '../persistence/repository/action-log.repository';
import * as _ from 'lodash';

@Injectable()
export class Modificator {

    protected readonly beforeBuildTaskCommandFactoryComponents: BeforeBuildTaskCommandFactoryInterface[];
    protected readonly afterBuildTaskCommandFactoryComponents: AfterBuildTaskCommandFactoryInterface[];

    constructor(
        protected readonly instanceRepository: InstanceRepository,
        protected readonly actionLogRepository: ActionLogRepository,
        protected readonly instantiationContextFactory: InstantiationContextFactory,
        protected readonly logger: BaseLogger,
        protected readonly commandExecutorComponent: CommandExecutorComponent,
        protected copyFileCommandFactoryComponent: CopyFileCommandFactoryComponent,
        protected interpolateFileCommandFactoryComponent: InterpolateFileCommandFactoryComponent,
        protected copyAssetIntoContainerCommandFactoryComponent: CopyAssetIntoContainerCommandFactoryComponent,
        protected executeHostCmdCommandFactoryComponent: ExecuteHostCmdCommandFactoryComponent,
        protected executeServiceCmdCommandFactoryComponent: ExecuteServiceCmdCommandFactoryComponent,
    ) {
        this.beforeBuildTaskCommandFactoryComponents = [
            copyFileCommandFactoryComponent,
            interpolateFileCommandFactoryComponent,
        ];

        this.afterBuildTaskCommandFactoryComponents = [
            copyAssetIntoContainerCommandFactoryComponent,
            executeHostCmdCommandFactoryComponent,
            executeServiceCmdCommandFactoryComponent,
        ];
    }

    async modifyInstance(
        definition: DefinitionInterface,
        modificationActionId: string,
        instance: InstanceInterface,
    ): Promise<any> {
        const action = this.findAction(definition.config, modificationActionId);

        const actionLog = await this.actionLogRepository.create(
            instance._id.toString(),
            action.id,
            action.type,
        );

        const actionLogId = actionLog._id.toString();

        const modificationContext = this.instantiationContextFactory.create(
            definition.config,
            instance._id.toString(),
            instance.hash,
            action.id,
        );
        // TODO Move adding services inside context factory.
        modificationContext.services = _.cloneDeep(instance.services);

        const modifyInstanceCommand = new CommandsList([], false);

        const updateInstance = async (): Promise<void> => {
            await this.instanceRepository.save(instance);
        };

        instance.failedAt = undefined;
        instance.completedAt = undefined;
        await updateInstance();

        this.addResetSource(modifyInstanceCommand, actionLogId, modificationContext, updateInstance);
        this.addBeforeBuildTasks(modifyInstanceCommand, actionLogId, modificationContext, updateInstance);
        this.addAfterBuildTasks(modifyInstanceCommand, actionLogId, modificationContext, updateInstance);

        return this.commandExecutorComponent
            .execute(modifyInstanceCommand)
            .then(
                async (): Promise<void> => {
                    this.logger.info('Modification started.');
                    actionLog.completedAt = new Date();
                    await actionLog.save();
                    instance.completedAt = new Date();
                    await updateInstance();
                },
                async (error: Error): Promise<void> => {
                    this.logger.error('Modification failed.');
                    actionLog.failedAt = new Date();
                    await actionLog.save();
                    instance.failedAt = new Date();
                    await updateInstance();
                },
            );
    }

    protected addResetSource(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new CommandsList(
                instantiationContext.sources.map(
                    source => new ContextAwareCommand(
                        actionLogId,
                        instantiationContext.id,
                        instantiationContext.hash,
                        `Reset repository for source \`${source.id}\``,
                        () => new ResetSourceCommand(
                            source.cloneUrl,
                            source.reference.type,
                            source.reference.name,
                            source.paths.dir.absolute.guest,
                        ),
                    ),
                ),
                false,
            ),
        );
    }

    // TODO Extract to a separate service.
    protected addBeforeBuildTasks(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new CommandsList(
                instantiationContext.sources.map(
                    source => new CommandsList(
                        source.beforeBuildTasks.map(
                            beforeBuildTask => this.createBeforeBuildTaskCommand(
                                beforeBuildTask,
                                source,
                                actionLogId,
                                instantiationContext,
                                updateInstance,
                            ),
                        ),
                        false,
                    ),
                ),
                false,
            ),
        );
    }

    // TODO Extract to a separate service.
    protected addAfterBuildTasks(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        const commandMapItems: CommandsMapItem[] = instantiationContext.afterBuildTasks.map(
            (afterBuildTask): CommandsMapItem => {
                const command = this.createAfterBuildTaskCommand(
                    afterBuildTask,
                    actionLogId,
                    instantiationContext,
                    updateInstance,
                );

                return new CommandsMapItem(
                    command,
                    afterBuildTask.id,
                    afterBuildTask.dependsOn || [],
                );
            },
        );

        createInstanceCommand.addCommand(
            new CommandsMap(commandMapItems),
        );
    }

    // TODO Extract to a separate service.
    protected createBeforeBuildTaskCommand(
        beforeBuildTask: InstantiationContextBeforeBuildTaskInterface,
        source: InstantiationContextSourceInterface,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        for (const factory of this.beforeBuildTaskCommandFactoryComponents) {
            if (factory.supportsType(beforeBuildTask.type)) {
                return factory.createCommand(
                    beforeBuildTask.type,
                    beforeBuildTask,
                    source,
                    actionLogId,
                    instantiationContext,
                    updateInstance,
                );
            }
        }

        throw new Error(`Unknown type of before build task ${beforeBuildTask.type} for source ${source.id}.`);
    }

    // TODO Extract to a separate service.
    protected createAfterBuildTaskCommand(
        afterBuildTask: InstantiationContextAfterBuildTaskInterface,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        for (const factory of this.afterBuildTaskCommandFactoryComponents) {
            if (factory.supportsType(afterBuildTask.type)) {
                return factory.createCommand(
                    afterBuildTask.type,
                    afterBuildTask,
                    actionLogId,
                    instantiationContext,
                    updateInstance,
                );
            }
        }

        throw new Error(`Unknown type of after build task ${afterBuildTask.type}.`);
    }


    protected findAction(definitionConfig: any, actionId: string): any {
        for (const action of definitionConfig.actions) {
            if ('modification' === action.type && actionId === action.id) {
                return action;
            }
        }

        throw new Error(`Invalid modification action '${actionId}'.`);
    }

}
