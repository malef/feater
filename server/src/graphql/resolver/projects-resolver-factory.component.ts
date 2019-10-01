import { Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../persistence/repository/project.repository';
import { ProjectTypeInterface } from '../type/project-type.interface';
import { ProjectInterface } from '../../persistence/interface/project.interface';
import { CreateProjectInputTypeInterface } from '../input-type/create-project-input-type.interface';
import { ResolverPaginationArgumentsHelper } from './pagination-argument/resolver-pagination-arguments-helper.component';
import { ResolverPaginationArgumentsInterface } from './pagination-argument/resolver-pagination-arguments.interface';
import { ResolverProjectFilterArgumentsInterface } from './filter-argument/resolver-project-filter-arguments.interface';
import * as escapeStringRegexp from 'escape-string-regexp';

@Injectable()
export class ProjectsResolverFactory {
    constructor(
        private readonly resolveListOptionsHelper: ResolverPaginationArgumentsHelper,
        private readonly projectRepository: ProjectRepository,
    ) {}

    protected readonly defaultSortKey = 'name_asc';

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
    ): (object: object, args: object) => Promise<ProjectTypeInterface[]> {
        return async (
            object: object,
            args: object,
        ): Promise<ProjectTypeInterface[]> => {
            const resolverListOptions = args as ResolverPaginationArgumentsInterface;
            const criteria = this.applyFilterArgumentToCriteria(
                queryExtractor ? queryExtractor(object) : {},
                args as ResolverProjectFilterArgumentsInterface,
            );
            const projects = await this.projectRepository.find(
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
            const data: ProjectTypeInterface[] = [];

            for (const project of projects) {
                data.push(this.mapPersistentModelToTypeModel(project));
            }

            return data;
        };
    }

    public getItemResolver(
        idExtractor: (obj: any, args: any) => string,
    ): (obj: any, args: any) => Promise<ProjectTypeInterface> {
        return async (obj: any, args: any): Promise<ProjectTypeInterface> => {
            return this.mapPersistentModelToTypeModel(
                await this.projectRepository.findById(idExtractor(obj, args)),
            );
        };
    }

    public getCreateItemResolver(): (
        obj: any,
        createProjectInput: CreateProjectInputTypeInterface,
    ) => Promise<ProjectTypeInterface> {
        return async (
            obj: any,
            createProjectInput: CreateProjectInputTypeInterface,
        ): Promise<ProjectTypeInterface> => {
            // TODO Add validation.
            const project = await this.projectRepository.create(
                createProjectInput,
            );

            return this.mapPersistentModelToTypeModel(project);
        };
    }

    protected applyFilterArgumentToCriteria(
        criteria: any,
        args: ResolverProjectFilterArgumentsInterface,
    ): object {
        if (args.name) {
            criteria.name = new RegExp(escapeStringRegexp(args.name));
        }

        return criteria;
    }

    protected mapPersistentModelToTypeModel(
        project: ProjectInterface,
    ): ProjectTypeInterface {
        return {
            id: project._id,
            name: project.name,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        } as ProjectTypeInterface;
    }
}
