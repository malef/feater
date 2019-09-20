import {Injectable} from '@nestjs/common';
import {ActionLogTypeInterface} from '../type/action-log-type.interface';
import {ResolverPaginationArgumentsHelper} from './pagination-argument/resolver-pagination-arguments-helper.component';
import {ResolverPaginationArgumentsInterface} from './pagination-argument/resolver-pagination-arguments.interface';
import {ResolverActionLogEntryFilterArgumentsInterface} from './filter-argument/resolver-action-log-entry-filter-arguments.interface';
import {ActionLogRepository} from '../../persistence/repository/action-log.repository';

@Injectable()
export class ActionLogsResolverFactory {
    constructor(
        private readonly resolveListOptionsHelper: ResolverPaginationArgumentsHelper,
        private readonly actionLogRepository: ActionLogRepository,
    ) { }

    public getListResolver(queryExtractor?: (object: any) => any): (object: any, args: any) => Promise<ActionLogTypeInterface[]> {
        return async (object: any, args: any): Promise<ActionLogTypeInterface[]> => {
            const resolverListOptions = args as ResolverPaginationArgumentsInterface;
            const criteria = this.applyFilterArgumentToCriteria(
                queryExtractor ? queryExtractor(object) : {},
                args as ResolverActionLogEntryFilterArgumentsInterface,
            );
            const actionLogs = await this.actionLogRepository.find(
                {instanceId: criteria.instanceId},
                resolverListOptions.offset,
                resolverListOptions.limit,
                {_id: 1},
            );
            const data: ActionLogTypeInterface[] = [];
            for (const actionLog of actionLogs) {
                data.push({
                    id: actionLog._id.toString(),
                    actionId: actionLog.actionId,
                    actionType: actionLog.actionType,
                    actionName: actionLog.actionName,
                    createdAt: actionLog.createdAt,
                    completedAt: actionLog.completedAt,
                    failedAt: actionLog.failedAt,
                } as ActionLogTypeInterface);
            }

            return data;
        };
    }

    protected applyFilterArgumentToCriteria(criteria: any, args: ResolverActionLogEntryFilterArgumentsInterface): any {
        return criteria;
    }
}
