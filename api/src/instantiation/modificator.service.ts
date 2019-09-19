import * as _ from 'lodash';
import {Injectable} from '@nestjs/common';
import {BaseLogger} from '../logger/base-logger';
import {CommandsList} from './executor/commands-list';
import {ContextAwareCommand} from './executor/context-aware-command.interface';
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
import {InstanceRepository} from '../persistence/repository/instance.repository';
import {CommandType} from './executor/command.type';
import {CommandsMap} from './executor/commands-map';
import {CommandsMapItem} from './executor/commands-map-item';
import {InstanceInterface} from '../persistence/interface/instance.interface';
import {DefinitionInterface} from '../persistence/interface/definition.interface';

@Injectable()
export class Modificator {

    protected readonly beforeBuildTaskCommandFactoryComponents: BeforeBuildTaskCommandFactoryInterface[];
    protected readonly afterBuildTaskCommandFactoryComponents: AfterBuildTaskCommandFactoryInterface[];

    constructor(
        protected readonly instanceRepository: InstanceRepository,
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
        // TODO Is this needed? It should be action id. Do we need a separate collection for it?
        const taskId = 'modification';

        const modificationContext = this.instantiationContextFactory.create(
            definition.config,
            instance.id,
            instance.hash,
            modificationActionId,
        );
        modificationContext.services = _.cloneDeep(instance.services); // TODO Move inside context factory.

        const modifyInstanceCommand = new CommandsList([], false);

        const updateInstance = async (): Promise<void> => {
            // Intentionally left empty.
        };

        await updateInstance();

        this.addResetSource(modifyInstanceCommand, taskId, modificationContext, updateInstance);
        this.addBeforeBuildTasks(modifyInstanceCommand, taskId, modificationContext, updateInstance);
        this.addAfterBuildTasks(modifyInstanceCommand, taskId, modificationContext, updateInstance);

        return this.commandExecutorComponent
            .execute(modifyInstanceCommand)
            .then(
                async (): Promise<void> => {
                    this.logger.info('Modification started.');
                    instance.completedAt = new Date();
                    await updateInstance();
                },
                async (error: Error): Promise<void> => {
                    this.logger.error('Modification failed.');
                    instance.failedAt = new Date();
                    await updateInstance();
                },
            );
    }

    protected addResetSource(
        createInstanceCommand: CommandsList,
        taskId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new CommandsList(
                instantiationContext.sources.map(
                    source => new ContextAwareCommand(
                        taskId,
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
        taskId: string,
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
                                taskId,
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
        taskId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        const commandMapItems: CommandsMapItem[] = instantiationContext.afterBuildTasks.map(
            (afterBuildTask): CommandsMapItem => {
                const command = this.createAfterBuildTaskCommand(
                    afterBuildTask,
                    taskId,
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
        taskId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        for (const factory of this.beforeBuildTaskCommandFactoryComponents) {
            if (factory.supportsType(beforeBuildTask.type)) {
                return factory.createCommand(
                    beforeBuildTask.type,
                    beforeBuildTask,
                    source,
                    taskId,
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
        taskId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        for (const factory of this.afterBuildTaskCommandFactoryComponents) {
            if (factory.supportsType(afterBuildTask.type)) {
                return factory.createCommand(
                    afterBuildTask.type,
                    afterBuildTask,
                    taskId,
                    instantiationContext,
                    updateInstance,
                );
            }
        }

        throw new Error(`Unknown type of after build task ${afterBuildTask.type}.`);
    }

}
