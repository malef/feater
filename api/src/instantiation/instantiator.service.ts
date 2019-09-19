import {Injectable} from '@nestjs/common';
import {BaseLogger} from '../logger/base-logger';
import {CommandsList} from './executor/commands-list';
import {ContextAwareCommand} from './executor/context-aware-command.interface';
import {CreateDirectoryCommand} from './command/create-directory/command';
import {CreateVolumeFromAssetCommand} from './command/create-volume-from-asset/command';
import {CreateVolumeFromAssetCommandResultInterface} from './command/create-volume-from-asset/command-result.interface';
import {CloneSourceCommand} from './command/clone-source/command';
import {ParseDockerComposeCommand} from './command/parse-docker-compose/command';
import {ParseDockerComposeCommandResultInterface} from './command/parse-docker-compose/command-result.interface';
import {PrepareProxyDomainCommand} from './command/prepare-port-domain/command';
import {PrepareProxyDomainCommandResultInterface} from './command/prepare-port-domain/command-result.interface';
import {ConfigureProxyDomainCommand} from './command/configure-proxy-domain/command';
import {ConfigureProxyDomainCommandResultInterface} from './command/configure-proxy-domain/command-result.interface';
import {RunDockerComposeCommand} from './command/run-docker-compose/command';
import {ConnectToNetworkCommand} from './command/connect-containers-to-network/command';
import {GetContainerIdsCommand} from './command/get-container-id/command';
import {GetContainerIdsCommandResultInterface} from './command/get-container-id/command-result.interface';
import {ConnectToNetworkCommandResultInterface} from './command/connect-containers-to-network/command-result.interface';
import {PrepareSourceEnvVarsCommand} from './command/prepare-source-env-vars/command';
import {PrepareSourceEnvVarsCommandResultInterface} from './command/prepare-source-env-vars/command-result.interface';
import {PrepareSummaryItemsCommand} from './command/prepare-summary-items/command';
import {CopyFileCommandFactoryComponent} from './command/before-build/copy-file/command-factory.component';
import {InterpolateFileCommandFactoryComponent} from './command/before-build/interpolate-file/command-factory.component';
import {BeforeBuildTaskCommandFactoryInterface} from './command/before-build/command-factory.interface';
import {CopyAssetIntoContainerCommandFactoryComponent} from './command/after-build/copy-asset-into-container/command-factory.component';
import {ExecuteHostCmdCommandFactoryComponent} from './command/after-build/execute-host-cmd/command-factory.component';
import {ExecuteServiceCmdCommandFactoryComponent} from './command/after-build/execute-service-cmd/command-factory.component';
import {AfterBuildTaskCommandFactoryInterface} from './command/after-build/command-factory.interface';
import {CommandExecutorComponent} from './executor/command-executor.component';
import {PrepareSummaryItemsCommandResultInterface} from './command/prepare-summary-items/command-result.interface';
import {InstantiationContextSourceInterface} from './instantiation-context/instantiation-context-source.interface';
import {InstantiationContextAfterBuildTaskInterface} from './instantiation-context/after-build/instantiation-context-after-build-task.interface';
import {InstantiationContextBeforeBuildTaskInterface} from './instantiation-context/before-build/instantiation-context-before-build-task.interface';
import {InstantiationContext} from './instantiation-context/instantiation-context';
import {InstantiationContextFactory} from './instantiation-context-factory.service';
import {EnableProxyDomainsCommand} from './command/enable-proxy-domains/command';
import {InstanceRepository} from '../persistence/repository/instance.repository';
import {CommandType} from './executor/command.type';
import {CommandsMap} from './executor/commands-map';
import {CommandsMapItem} from './executor/commands-map-item';
import {InstanceInterface} from '../persistence/interface/instance.interface';
import {DefinitionInterface} from '../persistence/interface/definition.interface';
import {ActionLogRepository} from '../persistence/repository/action-log.repository';
import * as path from 'path';
import * as _ from 'lodash';

@Injectable()
export class Instantiator {

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

    async createInstance(
        definition: DefinitionInterface,
        hash: string,
        instantiationActionId: string,
        instance: InstanceInterface,
    ): Promise<any> {
        const action = this.findAction(definition.config, instantiationActionId);

        const actionLog = await this.actionLogRepository.create(
            instance._id.toString(),
            action.id,
            action.type,
        );

        const actionLogId = actionLog._id.toString();

        const instantiationContext = this.instantiationContextFactory.create(
            definition.config,
            instance._id.toString(),
            hash,
            action.id,
        );

        const createInstanceCommand = new CommandsList([], false);

        const updateInstance = async (): Promise<void> => {
            instance.hash = instantiationContext.hash;
            instance.envVariables = instantiationContext.envVariables.toList();
            instance.summaryItems = instantiationContext.summaryItems.toList();
            instance.services = _.cloneDeep(instantiationContext.services);
            instance.proxiedPorts = _.cloneDeep(instantiationContext.proxiedPorts);
            // TODO Handle Feater variables.
            // TODO Handle volumes.

            await this.instanceRepository.save(instance);
        };

        await updateInstance();

        this.addCreateDirectory(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addCreateVolumeFromAssetsAndCloneSource(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addParseDockerCompose(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addPrepareProxyDomains(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addPrepareEnvVarsForSources(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addPrepareSummaryItems(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addBeforeBuildTasks(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addRunDockerCompose(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addGetContainerIds(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addConnectContainersToNetwork(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addConfigureProxyDomains(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addAfterBuildTasks(createInstanceCommand, actionLogId, instantiationContext, updateInstance);
        this.addEnableProxyDomains(createInstanceCommand, actionLogId, instantiationContext, updateInstance);

        return this.commandExecutorComponent
            .execute(createInstanceCommand)
            .then(
                async (): Promise<void> => {
                    this.logger.info('Instantiation started.');
                    instance.completedAt = new Date();
                    await updateInstance();
                },
                async (error: Error): Promise<void> => {
                    this.logger.error('Instantiation failed.');
                    instance.failedAt = new Date();
                    await updateInstance();
                },
            );
    }

    protected addCreateDirectory(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(new ContextAwareCommand(
            actionLogId,
            instantiationContext.id,
            instantiationContext.hash,
            `Create instance build directory`,
            () => new CreateDirectoryCommand(
                instantiationContext.paths.dir.absolute.guest,
            ),
        ));
    }

    protected addCreateVolumeFromAssetsAndCloneSource(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        const createVolumeFromAssetCommands = instantiationContext.volumes.map(
            volume => new ContextAwareCommand(
                actionLogId,
                instantiationContext.id,
                instantiationContext.hash,
                `Create asset volume \`${volume.id}\``,
                () => {
                    return new CreateVolumeFromAssetCommand(
                        volume.id,
                        volume.assetId,
                        instantiationContext.composeProjectName,
                        instantiationContext.paths.dir.absolute.guest,
                        volume.paths.extractDir.absolute.guest,
                        volume.paths.extractDir.absolute.host,
                    );
                },
                async (result: CreateVolumeFromAssetCommandResultInterface): Promise<void> => {
                    instantiationContext.mergeEnvVariablesSet(result.envVariables);
                    instantiationContext.mergeFeaterVariablesSet(result.featerVariables);
                    await updateInstance();
                },
            ),
        );

        const cloneSourceCommands = instantiationContext.sources.map(
            source => new ContextAwareCommand(
                actionLogId,
                instantiationContext.id,
                instantiationContext.hash,
                `Clone repository for source \`${source.id}\``,
                () => new CloneSourceCommand(
                    source.cloneUrl,
                    source.reference.type,
                    source.reference.name,
                    source.paths.dir.absolute.guest,
                ),
            ),
        );

        createInstanceCommand.addCommand(
            new CommandsList(
                createVolumeFromAssetCommands.concat(cloneSourceCommands),
                false,
            ),
        );
    }

    /**
     * This stage will detect what services are available and will detect container prefix
     * names they should be assigned.
     */
    protected addParseDockerCompose(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new ContextAwareCommand(
                actionLogId,
                instantiationContext.id,
                instantiationContext.hash,
                `Parse docker-compose configuration`,
                () => {
                    const source = instantiationContext.findSource(instantiationContext.composeFiles[0].sourceId);

                    return new ParseDockerComposeCommand(
                        instantiationContext.composeFiles[0].composeFileRelativePaths.map(
                            composeFileRelativePath => path.join(
                                source.paths.dir.absolute.guest,
                                composeFileRelativePath,
                            ),
                        ),
                        instantiationContext.composeProjectName,
                    );
                },
                async (result: ParseDockerComposeCommandResultInterface): Promise<void> => {
                    for (const service of result.services) {
                        instantiationContext.services.push({
                            id: service.id,
                            containerNamePrefix: service.containerNamePrefix,
                        });
                    }
                },
            ),
        );
    }

    /**
     * Proxy domain is generated for each proxied port so that it will be available for interpolation
     * inside before build tasks and in env variables when docker-compose setup is run.
     */
    protected addPrepareProxyDomains(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new CommandsList(
                instantiationContext.proxiedPorts.map(
                    proxiedPort => new ContextAwareCommand(
                        actionLogId,
                        instantiationContext.id,
                        instantiationContext.hash,
                        `Prepare domain for proxied port \`${proxiedPort.id}\``,
                        () => new PrepareProxyDomainCommand(
                            instantiationContext.hash,
                            proxiedPort.id,
                        ),
                        async (result: PrepareProxyDomainCommandResultInterface): Promise<void> => {
                            proxiedPort.domain = result.proxyDomain;
                            instantiationContext.mergeEnvVariablesSet(result.envVariables);
                            instantiationContext.mergeFeaterVariablesSet(result.featerVariables);
                            await updateInstance();
                        },
                    ),
                ),
                false,
            ),
        );
    }

    /**
     * Paths to source for guest and host are made available as env variables.
     */
    protected addPrepareEnvVarsForSources(
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
                        `Prepare environment variables for source \`${source.id}\``,
                        () => new PrepareSourceEnvVarsCommand(
                            source.id,
                            source.paths.dir.absolute.guest,
                            source.paths.dir.absolute.host,
                        ),
                        async (result: PrepareSourceEnvVarsCommandResultInterface): Promise<void> => {
                            instantiationContext.mergeEnvVariablesSet(result.envVariables);
                            instantiationContext.mergeFeaterVariablesSet(result.featerVariables);
                            await updateInstance();
                        },
                    ),
                ),
                false,
            ),
        );
    }

    protected addPrepareSummaryItems(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new ContextAwareCommand(
                actionLogId,
                instantiationContext.id,
                instantiationContext.hash,
                `Prepare summary items`,
                () => new PrepareSummaryItemsCommand(
                    instantiationContext.featerVariables,
                    instantiationContext.nonInterpolatedSummaryItems,
                ),
                async (result: PrepareSummaryItemsCommandResultInterface): Promise<void> => {
                    instantiationContext.summaryItems = result.summaryItems;
                    await updateInstance();
                },
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

    protected addRunDockerCompose(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new ContextAwareCommand(
                actionLogId,
                instantiationContext.id,
                instantiationContext.hash,
                `Run docker-compose`,
                () => {
                    const composeFile = instantiationContext.composeFiles[0]; // TODO Handle multiple compose files.
                    const source = instantiationContext.findSource(composeFile.sourceId);

                    return new RunDockerComposeCommand(
                        path.join(source.paths.dir.absolute.guest, composeFile.envDirRelativePath),
                        composeFile.composeFileRelativePaths.map(
                            composeFileRelativePath => path.join(
                                source.paths.dir.absolute.guest,
                                composeFileRelativePath,
                            ),
                        ),
                        instantiationContext.composeProjectName,
                        instantiationContext.envVariables,
                    );
                },
            ),
        );
    }

    /**
     * When docker-compose setup is run it's possible to inspect containers and retrieve their ids
     * which will be needed to provide proxy domain for specified ports.
     */
    protected addGetContainerIds(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new ContextAwareCommand(
                actionLogId,
                instantiationContext.id,
                instantiationContext.hash,
                `Get container ids`,
                () => new GetContainerIdsCommand(
                    instantiationContext.composeProjectName,
                    instantiationContext.services.map(
                        service => ({
                            serviceId: service.id,
                            containerNamePrefix: service.containerNamePrefix,
                        }),
                    ),
                ),
                async (result: GetContainerIdsCommandResultInterface): Promise<void> => {
                    for (const {serviceId, containerId} of result.serviceContainerIds) {
                        const service = instantiationContext.findService(serviceId);
                        service.containerId = containerId;
                    }
                    instantiationContext.mergeEnvVariablesSet(result.envVariables);
                    instantiationContext.mergeFeaterVariablesSet(result.featerVariables);
                    await updateInstance();
                },
            ),
        );
    }

    /**
     * All containers which have some ports exposed are connected to a separate network together with
     * Nginx container that will handle configurations for their proxy domains.
     */
    protected addConnectContainersToNetwork(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new CommandsList(
                instantiationContext.proxiedPorts.map(
                    proxiedPort => new ContextAwareCommand(
                        actionLogId,
                        instantiationContext.id,
                        instantiationContext.hash,
                        `Connect service \`${proxiedPort.serviceId}\` to proxy network`,
                        () => {
                            const service = instantiationContext.findService(proxiedPort.serviceId);

                            return new ConnectToNetworkCommand(
                                service.id,
                                service.containerId,
                            );
                        },
                        async (result: ConnectToNetworkCommandResultInterface): Promise<void> => {
                            const service = instantiationContext.findService(proxiedPort.serviceId);
                            service.ipAddress = result.ipAddress;
                        },
                    ),
                ),
                false,
            ),
        );
    }

    protected addConfigureProxyDomains(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new CommandsList(
                instantiationContext.proxiedPorts.map(
                    proxiedPort => new ContextAwareCommand(
                        actionLogId,
                        instantiationContext.id,
                        instantiationContext.hash,
                        `Prepare configuration for proxied port \`${proxiedPort.id}\``,
                        () => {
                            const service = instantiationContext.findService(proxiedPort.serviceId);

                            return new ConfigureProxyDomainCommand(
                                proxiedPort.serviceId,
                                service.ipAddress,
                                proxiedPort.port,
                                proxiedPort.domain,
                            );
                        },
                        async (result: ConfigureProxyDomainCommandResultInterface): Promise<void> => {
                            proxiedPort.nginxConfig = result.nginxConfig;
                        },
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

    protected addEnableProxyDomains(
        createInstanceCommand: CommandsList,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): void {
        createInstanceCommand.addCommand(
            new ContextAwareCommand(
                actionLogId,
                instantiationContext.id,
                instantiationContext.hash,
                `Enable configuration for proxied ports`,
                () => new EnableProxyDomainsCommand(
                    instantiationContext.hash,
                    instantiationContext.proxiedPorts.map(
                        proxiedPort => proxiedPort.nginxConfig,
                    ),
                ),
            ),
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
            if ('instantiation' === action.type && actionId === action.id) {
                return action;
            }
        }

        throw new Error(`Invalid instantiation action '${actionId}'.`);
    }

}
