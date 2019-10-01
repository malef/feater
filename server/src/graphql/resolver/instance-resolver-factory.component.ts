import { execSync } from 'child_process';
import { Injectable } from '@nestjs/common';
import { InstanceTypeInterface } from '../type/instance-type.interface';
import { InstanceRepository } from '../../persistence/repository/instance.repository';
import { InstanceInterface } from '../../persistence/interface/instance.interface';
import { DefinitionInterface } from '../../persistence/interface/definition.interface';
import { Instantiator } from '../../instantiation/instantiator.service';
import { Modificator } from '../../instantiation/modificator.service';
import { CreateInstanceInputTypeInterface } from '../input-type/create-instance-input-type.interface';
import { ModifyInstanceInputTypeInterface } from '../input-type/modify-instance-input-type.interface';
import { RemoveInstanceInputTypeInterface } from '../input-type/remove-instance-input-type.interface';
import { StopServiceInputTypeInterface } from '../input-type/stop-service-input-type.interface';
import { PauseServiceInputTypeInterface } from '../input-type/pause-service-input-type.interface';
import { StartServiceInputTypeInterface } from '../input-type/start-service-input-type.interface';
import { UnpauseServiceInputTypeInterface } from '../input-type/unpause-service-input-type.interface';
import { DefinitionRepository } from '../../persistence/repository/definition.repository';
import { ActionLogRepository } from '../../persistence/repository/action-log.repository';
import { CommandLogRepository } from '../../persistence/repository/command-log.repository';
import { ResolverPaginationArgumentsHelper } from './pagination-argument/resolver-pagination-arguments-helper.component';
import { ResolverPaginationArgumentsInterface } from './pagination-argument/resolver-pagination-arguments.interface';
import { ResolverInstanceFilterArgumentsInterface } from './filter-argument/resolver-instance-filter-arguments.interface';
import { environment } from '../../environments/environment';
import * as nanoidGenerate from 'nanoid/generate';
import * as escapeStringRegexp from 'escape-string-regexp';
import * as path from 'path';

@Injectable()
export class InstanceResolverFactory {
    constructor(
        private readonly resolveListOptionsHelper: ResolverPaginationArgumentsHelper,
        private readonly instanceRepository: InstanceRepository,
        private readonly definitionRepository: DefinitionRepository,
        private readonly actionLogRepository: ActionLogRepository,
        private readonly commandLogRepository: CommandLogRepository,
        private readonly instantiator: Instantiator,
        private readonly modificator: Modificator,
    ) {}

    protected readonly defaultSortKey = 'created_at_desc';

    readonly sortMap = {
        name_asc: {
            name: 'asc',
            createdAt: 'desc',
            _id: 'desc',
        },
        name_desc: {
            name: 'desc',
            createdAt: 'desc',
            _id: 'desc',
        },
        created_at_asc: {
            createdAt: 'asc',
            _id: 'desc',
        },
        created_at_desc: {
            createdAt: 'desc',
            _id: 'desc',
        },
    };

    public getListResolver(
        queryExtractor?: (obj: any, args: any) => any,
    ): (obj: any, args: any) => Promise<InstanceTypeInterface[]> {
        return async (
            obj: any,
            args: any,
        ): Promise<InstanceTypeInterface[]> => {
            const resolverListOptions = args as ResolverPaginationArgumentsInterface;
            const criteria = this.applyFilterArgumentToCriteria(
                queryExtractor ? queryExtractor(obj, args) : {},
                args as ResolverInstanceFilterArgumentsInterface,
            );
            const instances = await this.instanceRepository.find(
                criteria,
                this.resolveListOptionsHelper.getOffset(
                    resolverListOptions.offset,
                ),
                this.resolveListOptionsHelper.getLimit(
                    resolverListOptions.limit,
                ),
                this.resolveListOptionsHelper.getSort(
                    this.defaultSortKey,
                    this.sortMap,
                    resolverListOptions.sortKey,
                ),
            );
            const data: InstanceTypeInterface[] = [];
            for (const instance of instances) {
                const definition = await this.definitionRepository.findByIdOrFail(
                    instance.definitionId,
                );
                data.push(
                    this.mapPersistentModelToTypeModel(instance, definition),
                );
            }

            return data;
        };
    }

    public getItemResolver(
        idExtractor: (obj: any, args: any) => string,
    ): (obj: any, args: any) => Promise<InstanceTypeInterface> {
        return async (obj: any, args: any): Promise<InstanceTypeInterface> => {
            const instance = await this.instanceRepository.findById(
                idExtractor(obj, args),
            );
            const definition = await this.definitionRepository.findByIdOrFail(
                instance.definitionId,
            );

            return this.mapPersistentModelToTypeModel(instance, definition);
        };
    }

    public getCreateItemResolver(): (
        obj: any,
        createInstanceInput: CreateInstanceInputTypeInterface,
    ) => Promise<InstanceTypeInterface> {
        return async (
            obj: any,
            createInstanceInput: CreateInstanceInputTypeInterface,
        ): Promise<InstanceTypeInterface> => {
            // TODO Add validation.

            const instance = await this.instanceRepository.create(
                createInstanceInput,
            );
            const definition = await this.definitionRepository.findByIdOrFail(
                instance.definitionId,
            );
            const hash = nanoidGenerate(
                '0123456789abcdefghijklmnopqrstuvwxyz',
                8,
            );

            process.nextTick(() => {
                this.instantiator.createInstance(
                    definition,
                    hash,
                    createInstanceInput.instantiationActionId,
                    instance,
                );
            });

            return this.mapPersistentModelToTypeModel(instance, definition);
        };
    }

    public getModifyItemResolver(): (
        obj: any,
        modifyInstanceInput: ModifyInstanceInputTypeInterface,
    ) => Promise<InstanceTypeInterface> {
        return async (
            obj: any,
            modifyInstanceInput: ModifyInstanceInputTypeInterface,
        ): Promise<InstanceTypeInterface> => {
            // TODO Add validation.
            const instance = await this.instanceRepository.findByIdOrFail(
                modifyInstanceInput.instanceId,
            );
            const definition = await this.definitionRepository.findByIdOrFail(
                instance.definitionId,
            );
            if (definition.updatedAt > instance.createdAt) {
                throw new Error(
                    'Cannot modify this instance as related definition was subsequently modified.',
                );
            }

            process.nextTick(() => {
                this.modificator.modifyInstance(
                    definition,
                    modifyInstanceInput.modificationActionId,
                    instance,
                );
            });

            return this.mapPersistentModelToTypeModel(instance, definition);
        };
    }

    public getStopItemServiceResolver(): (
        obj: any,
        stopServiceInput: StopServiceInputTypeInterface,
    ) => Promise<InstanceTypeInterface> {
        return async (
            obj: any,
            stopServiceInput: StopServiceInputTypeInterface,
        ): Promise<InstanceTypeInterface> => {
            // TODO Add validation.
            const instance = await this.instanceRepository.findByIdOrFail(
                stopServiceInput.instanceId,
            );
            const definition = await this.definitionRepository.findByIdOrFail(
                instance.definitionId,
            );
            for (const service of instance.services) {
                if (stopServiceInput.serviceId === service.id) {
                    execSync(
                        `${environment.instantiation.dockerBinaryPath} stop ${service.containerId}`,
                    );

                    break;
                }
            }

            return this.mapPersistentModelToTypeModel(instance, definition);
        };
    }

    public getPauseItemServiceResolver(): (
        obj: any,
        pauseServiceInput: PauseServiceInputTypeInterface,
    ) => Promise<InstanceTypeInterface> {
        return async (
            obj: any,
            pauseServiceInput: PauseServiceInputTypeInterface,
        ): Promise<InstanceTypeInterface> => {
            // TODO Add validation.
            const instance = await this.instanceRepository.findByIdOrFail(
                pauseServiceInput.instanceId,
            );
            const definition = await this.definitionRepository.findByIdOrFail(
                instance.definitionId,
            );
            for (const service of instance.services) {
                if (pauseServiceInput.serviceId === service.id) {
                    execSync(
                        `${environment.instantiation.dockerBinaryPath} pause ${service.containerId}`,
                    );

                    break;
                }
            }

            return this.mapPersistentModelToTypeModel(instance, definition);
        };
    }

    public getStartItemServiceResolver(): (
        obj: any,
        startServiceInput: StartServiceInputTypeInterface,
    ) => Promise<InstanceTypeInterface> {
        return async (
            obj: any,
            startServiceInput: StartServiceInputTypeInterface,
        ): Promise<InstanceTypeInterface> => {
            // TODO Add validation.
            const instance = await this.instanceRepository.findByIdOrFail(
                startServiceInput.instanceId,
            );
            const definition = await this.definitionRepository.findByIdOrFail(
                instance.definitionId,
            );
            for (const service of instance.services) {
                if (startServiceInput.serviceId === service.id) {
                    execSync(
                        `${environment.instantiation.dockerBinaryPath} start ${service.containerId}`,
                    );

                    break;
                }
            }

            return this.mapPersistentModelToTypeModel(instance, definition);
        };
    }

    public getUnpauseItemServiceResolver(): (
        obj: any,
        unpauseServiceInput: UnpauseServiceInputTypeInterface,
    ) => Promise<InstanceTypeInterface> {
        return async (
            obj: any,
            unpauseServiceInput: UnpauseServiceInputTypeInterface,
        ): Promise<InstanceTypeInterface> => {
            // TODO Add validation.
            const instance = await this.instanceRepository.findByIdOrFail(
                unpauseServiceInput.instanceId,
            );
            const definition = await this.definitionRepository.findByIdOrFail(
                instance.definitionId,
            );
            for (const service of instance.services) {
                if (unpauseServiceInput.serviceId === service.id) {
                    execSync(
                        `${environment.instantiation.dockerBinaryPath} unpause ${service.containerId}`,
                    );

                    break;
                }
            }

            return this.mapPersistentModelToTypeModel(instance, definition);
        };
    }

    public getRemoveItemResolver(): (
        obj: any,
        removeInstanceInput: RemoveInstanceInputTypeInterface,
    ) => Promise<boolean> {
        return async (
            obj: any,
            removeInstanceInput: RemoveInstanceInputTypeInterface,
        ): Promise<boolean> => {
            const instance = await this.instanceRepository.findById(
                removeInstanceInput.id,
            );
            execSync('bash -c remove-instance.sh', {
                cwd: path.join(environment.guestPaths.root, 'bin'),
                env: {
                    INSTANCE_HASH: instance.hash,
                    COMPOSE_PROJECT_NAME_PREFIX: `${environment.instantiation.containerNamePrefix}${instance.hash}`,
                    FEATER_GUEST_PATH_BUILD: environment.guestPaths.build,
                    FEATER_GUEST_PATH_PROXY_DOMAIN:
                        environment.guestPaths.proxyDomain,
                    FEATER_NGINX_CONTAINER_NAME: 'feater_nginx',
                },
            });

            await this.actionLogRepository.actionLogModel.deleteMany({
                instanceId: instance._id.toString(),
            });
            await this.commandLogRepository.commandLogModel.deleteMany({
                instanceId: instance._id.toString(),
            });
            await this.instanceRepository.remove(removeInstanceInput.id);

            return true;
        };
    }

    protected applyFilterArgumentToCriteria(
        criteria: any,
        args: ResolverInstanceFilterArgumentsInterface,
    ): object {
        if (args.name) {
            criteria.name = new RegExp(escapeStringRegexp(args.name));
        }
        if (args.projectId) {
            criteria.projectId = args.projectId;
        }
        if (args.definitionId) {
            criteria.definitionId = args.definitionId;
        }

        return criteria;
    }

    protected mapPersistentModelToTypeModel(
        instance: InstanceInterface,
        definition: DefinitionInterface,
    ): InstanceTypeInterface {
        const mapped = {
            id: instance._id,
            hash: instance.hash,
            name: instance.name,
            definitionId: instance.definitionId,
            services: instance.services,
            summaryItems: instance.summaryItems,
            downloadables: instance.downloadables,
            envVariables: instance.envVariables,
            proxiedPorts: instance.proxiedPorts,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
            completedAt: instance.completedAt,
            failedAt: instance.failedAt,
            isModificationAllowed: definition.updatedAt <= instance.createdAt,
        } as InstanceTypeInterface;

        return mapped;
    }
}
