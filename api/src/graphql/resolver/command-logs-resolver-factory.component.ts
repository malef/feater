import {Injectable} from '@nestjs/common';
import {CommandLogTypeInterface} from '../type/command-log-type.interface';
import {ResolverPaginationArgumentsHelper} from './pagination-argument/resolver-pagination-arguments-helper.component';
import {ResolverPaginationArgumentsInterface} from './pagination-argument/resolver-pagination-arguments.interface';
import {ResolverCommandLogEntryFilterArgumentsInterface} from './filter-argument/resolver-command-log-entry-filter-arguments.interface';
import {CommandLogRepository} from '../../persistence/repository/command-log.repository';
import {PathHelper} from '../../instantiation/helper/path-helper.component';
import * as os from 'os';
import * as fs from 'fs';

@Injectable()
export class CommandLogsResolverFactory {
    constructor(
        private readonly resolveListOptionsHelper: ResolverPaginationArgumentsHelper,
        private readonly commandLogRepository: CommandLogRepository,
        private readonly pathHelper: PathHelper,
    ) { }

    public getListResolver(queryExtractor?: (object: any) => any): (object: any, args: any) => Promise<CommandLogTypeInterface[]> {
        return async (object: any, args: any): Promise<CommandLogTypeInterface[]> => {
            const resolverListOptions = args as ResolverPaginationArgumentsInterface;
            const criteria = this.applyFilterArgumentToCriteria(
                queryExtractor ? queryExtractor(object) : {},
                args as ResolverCommandLogEntryFilterArgumentsInterface,
            );
            const commandLogs = await this.commandLogRepository.find(
                {actionLogId: criteria.actionLogId},
                resolverListOptions.offset,
                resolverListOptions.limit,
                {_id: 1},
            );
            const data: CommandLogTypeInterface[] = [];
            for (const commandLog of commandLogs) {
                const commandLogPath = this.pathHelper.getCommandLogPaths(commandLog.instanceHash, commandLog._id.toString());
                const commandLogEntries = fs.readFileSync(commandLogPath.absolute.guest).toString();
                data.push({
                    id: commandLog._id.toString(),
                    description: commandLog.description,
                    createdAt: commandLog.createdAt,
                    completedAt: commandLog.completedAt,
                    failedAt: commandLog.failedAt,
                    entries: commandLogEntries
                        .split(os.EOL)
                        .filter((entry: string) => {
                            return ('' !== entry);
                        })
                        .map((entry: string) => {
                            const parsedEntry = JSON.parse(entry);

                            return {
                                level: parsedEntry.level,
                                message: parsedEntry.message,
                            };
                        }),
                } as CommandLogTypeInterface);
            }

            return data;
        };
    }

    protected applyFilterArgumentToCriteria(criteria: any, args: ResolverCommandLogEntryFilterArgumentsInterface): any {
        return criteria;
    }
}
