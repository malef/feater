import { Injectable } from '@nestjs/common';
import { DefinitionTypeInterface } from '../type/definition-type.interface';
import { DefinitionRepository } from '../../persistence/repository/definition.repository';
import { DefinitionConfigMapper } from './definition-config-mapper.component';
import { DefinitionInterface } from '../../persistence/interface/definition.interface';
import { CreateDefinitionInputTypeInterface } from '../input-type/create-definition-input-type.interface';
import { ResolverPaginationArgumentsInterface } from './pagination-argument/resolver-pagination-arguments.interface';
import { ResolverPaginationArgumentsHelper } from './pagination-argument/resolver-pagination-arguments-helper.component';
import { ResolverDefinitionFilterArgumentsInterface } from './filter-argument/resolver-definition-filter-arguments.interface';
import { DeployKeyRepository } from '../../persistence/repository/deploy-key.repository';
import * as escapeStringRegexp from 'escape-string-regexp';
import * as jsYaml from 'js-yaml';
import * as snakeCaseKeys from 'snakecase-keys';
import { SourceTypeInterface } from '../type/nested/definition-config/source-type.interface';
import { DeployKeyInterface } from '../../persistence/interface/deploy-key.interface';
import { DeployKeyTypeInterface } from '../type/deploy-key-type.interface';
import { PredictedEnvVariableTypeInterface } from '../type/predicted-env-variable-type.interface';
import { VariablesPredictor } from '../../instantiation/variable/variables-predictor.service';
import { PredictedFeaterVariableTypeInterface } from '../type/predicted-feater-variable-type.interface';
import { UpdateDefinitionInputTypeInterface } from '../input-type/update-definition-input-type.interface';
import { RemoveDefinitionInputTypeInterface } from '../input-type/remove-definition-input-type.interface';
import { InstanceRepository } from '../../persistence/repository/instance.repository';

@Injectable()
export class DefinitionResolverFactory {
    constructor(
        private readonly resolveListOptionsHelper: ResolverPaginationArgumentsHelper,
        private readonly definitionRepository: DefinitionRepository,
        private readonly instanceRepository: InstanceRepository,
        private readonly deployKeyRepository: DeployKeyRepository,
        private readonly definitionConfigMapper: DefinitionConfigMapper,
        private readonly variablePredictor: VariablesPredictor,
    ) {}

    protected readonly defaultSortKey = 'created_at_desc';

    protected readonly sortMap = {
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
        queryExtractor?: (object: object) => object,
    ): (object: object, args: object) => Promise<DefinitionTypeInterface[]> {
        return async (
            object: object,
            args: object,
        ): Promise<DefinitionTypeInterface[]> => {
            const resolverListOptions = args as ResolverPaginationArgumentsInterface;
            const criteria = this.applyFilterArgumentToCriteria(
                queryExtractor ? queryExtractor(object) : {},
                args as ResolverDefinitionFilterArgumentsInterface,
            );
            const definitions = await this.definitionRepository.find(
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
            const data: DefinitionTypeInterface[] = [];
            for (const definition of definitions) {
                data.push(this.mapPersistentModelToTypeModel(definition));
            }

            return data;
        };
    }

    public getItemResolver(
        idExtractor: (obj: any, args: any) => string,
    ): (obj: any, args: any) => Promise<DefinitionTypeInterface> {
        return async (
            obj: any,
            args: any,
        ): Promise<DefinitionTypeInterface> => {
            return this.mapPersistentModelToTypeModel(
                await this.definitionRepository.findById(
                    idExtractor(obj, args),
                ),
            );
        };
    }

    public getCreateItemResolver(): (
        obj: any,
        createDefinitionInput: CreateDefinitionInputTypeInterface,
    ) => Promise<DefinitionTypeInterface> {
        return async (
            obj: any,
            createDefinitionInput: CreateDefinitionInputTypeInterface,
        ): Promise<DefinitionTypeInterface> => {
            // TODO Add input validation.
            this.fixConfigInput(createDefinitionInput.config);
            const definition = await this.definitionRepository.create(
                createDefinitionInput,
            );

            return this.mapPersistentModelToTypeModel(definition);
        };
    }

    public getUpdateItemResolver(): (
        obj: any,
        updateDefinitionInput: UpdateDefinitionInputTypeInterface,
    ) => Promise<DefinitionTypeInterface> {
        return async (
            obj: any,
            updateDefinitionInput: UpdateDefinitionInputTypeInterface,
        ): Promise<DefinitionTypeInterface> => {
            // TODO Add input validation.
            this.fixConfigInput(updateDefinitionInput.config);
            const definition = await this.definitionRepository.update(
                updateDefinitionInput.id,
                updateDefinitionInput,
            );

            return this.mapPersistentModelToTypeModel(definition);
        };
    }

    public getRemoveItemResolver(): (
        obj: any,
        removeDefinitionInput: RemoveDefinitionInputTypeInterface,
    ) => Promise<boolean> {
        return async (
            obj: any,
            removeDefinitionInput: RemoveDefinitionInputTypeInterface,
        ): Promise<boolean> => {
            const definition = await this.definitionRepository.findByIdOrFail(
                removeDefinitionInput.id,
            );
            const instances = await this.instanceRepository.find(
                { definitionId: definition.id },
                0,
                1,
            );
            if (!!instances.length) {
                throw new Error('Definition has some instances.');
            }

            return await this.definitionRepository.remove(
                removeDefinitionInput.id,
            );
        };
    }

    public getConfigAsYamlResolver(): (obj: any, args: any) => string {
        return (obj: any, args: any): string => {
            return jsYaml.safeDump(snakeCaseKeys(obj.config), {
                indent: 4,
                flowLevel: -1,
            });
        };
    }

    public getDeployKeysResolver(): (
        obj: DefinitionInterface,
        args: any,
    ) => Promise<DeployKeyTypeInterface[]> {
        return async (
            obj: DefinitionInterface,
            args: any,
        ): Promise<DeployKeyTypeInterface[]> => {
            const deployKeys: DeployKeyInterface[] = [];
            for (const source of obj.config.sources) {
                const sourceDeployKeys = await this.deployKeyRepository.findByCloneUrl(
                    (source as SourceTypeInterface).cloneUrl,
                );
                if (1 < sourceDeployKeys.length) {
                    throw new Error('More than one deploy key found.');
                }
                if (1 === sourceDeployKeys.length) {
                    deployKeys.push(sourceDeployKeys[0]);
                }
            }

            const mappedDeployKeys: DeployKeyTypeInterface[] = [];
            for (const deployKey of deployKeys) {
                mappedDeployKeys.push({
                    id: deployKey.id,
                    cloneUrl: deployKey.cloneUrl,
                    publicKey: deployKey.publicKey,
                    createdAt: deployKey.createdAt,
                    updatedAt: deployKey.updatedAt,
                });
            }

            return mappedDeployKeys;
        };
    }

    public getPredictedEnvVariablesResolver(): (
        obj: DefinitionInterface,
        args: any,
    ) => Promise<PredictedEnvVariableTypeInterface[]> {
        return async (
            obj: DefinitionInterface,
            args: any,
        ): Promise<PredictedEnvVariableTypeInterface[]> => {
            const predictedEnvVariables = this.variablePredictor.predictEnvVariables(
                obj.config,
            );
            const mappedPredictedEnvVariables: PredictedEnvVariableTypeInterface[] = [];

            for (const predictedEnvVariable of predictedEnvVariables) {
                mappedPredictedEnvVariables.push({
                    name: predictedEnvVariable.name,
                    value: predictedEnvVariable.value,
                    pattern: predictedEnvVariable.pattern,
                });
            }

            return mappedPredictedEnvVariables;
        };
    }

    public getPredictedFeaterVariablesResolver(): (
        obj: DefinitionInterface,
        args: any,
    ) => Promise<PredictedFeaterVariableTypeInterface[]> {
        return async (
            obj: DefinitionInterface,
            args: any,
        ): Promise<PredictedFeaterVariableTypeInterface[]> => {
            const predictedFeaterVariables = this.variablePredictor.predictFeaterVariables(
                obj.config,
            );
            const mappedPredictedFeaterVariables: PredictedFeaterVariableTypeInterface[] = [];

            for (const predictedFeaterVariable of predictedFeaterVariables) {
                mappedPredictedFeaterVariables.push({
                    name: predictedFeaterVariable.name,
                    value: predictedFeaterVariable.value,
                    pattern: predictedFeaterVariable.pattern,
                });
            }

            return mappedPredictedFeaterVariables;
        };
    }

    protected applyFilterArgumentToCriteria(
        criteria: any,
        args: ResolverDefinitionFilterArgumentsInterface,
    ): object {
        if (args.name) {
            criteria.name = new RegExp(escapeStringRegexp(args.name));
        }
        if (args.projectId) {
            criteria.projectId = args.projectId;
        }

        return criteria;
    }

    protected mapPersistentModelToTypeModel(
        definition: DefinitionInterface,
    ): DefinitionTypeInterface {
        return {
            id: definition._id,
            name: definition.name,
            projectId: definition.projectId,
            config: this.definitionConfigMapper.map(definition.config),
            createdAt: definition.createdAt,
            updatedAt: definition.updatedAt,
        } as DefinitionTypeInterface;
    }

    protected fixConfigInput(config: any): void {
        for (const source of config.sources) {
            source.id = source.id.trim();
            source.cloneUrl = source.cloneUrl.trim();
            source.reference.name = source.reference.name.trim();
        }
    }
}
