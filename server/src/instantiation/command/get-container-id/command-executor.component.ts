import * as escapeStringRegexp from 'escape-string-regexp';
import { execSync } from 'child_process';
import { Injectable } from '@nestjs/common';
import { SimpleCommandExecutorComponentInterface } from '../../executor/simple-command-executor-component.interface';
import { SimpleCommand } from '../../executor/simple-command';
import {
    GetContainerIdsCommandResultInterface,
    GetContainerIdsCommandResultServiceContainerIdInterface,
} from './command-result.interface';
import { GetContainerIdsCommand } from './command';
import { environment } from '../../../environments/environment';
import { EnvVariablesSet } from '../../sets/env-variables-set';
import { FeaterVariablesSet } from '../../sets/feater-variables-set';

const BUFFER_SIZE = 64 * 1048576; // 64M

@Injectable()
export class GetContainerIdsCommandExecutorComponent
    implements SimpleCommandExecutorComponentInterface {
    supports(command: SimpleCommand) {
        return command instanceof GetContainerIdsCommand;
    }

    async execute(command: SimpleCommand) {
        const typedCommand = command as GetContainerIdsCommand;
        const logger = typedCommand.commandLogger;

        logger.info('Determining container ids.');

        const containerInspects = JSON.parse(
            execSync(
                [
                    environment.instantiation.dockerBinaryPath,
                    'inspect',
                    `$(${environment.instantiation.dockerBinaryPath} ps -q --no-trunc --filter name=${typedCommand.composeProjectName})`,
                ].join(' '),
                { maxBuffer: BUFFER_SIZE },
            ).toString(),
        );

        const envVariables = new EnvVariablesSet();
        const featerVariables = new FeaterVariablesSet();
        const serviceContainerIds: GetContainerIdsCommandResultServiceContainerIdInterface[] = [];
        for (const {
            serviceId,
            containerNamePrefix,
        } of typedCommand.serviceContainerNamePrefixes) {
            const containerNameRegExp = new RegExp(
                `^/${escapeStringRegexp(containerNamePrefix)}_1+$`,
            );
            for (const containerInspect of containerInspects) {
                const containerId: string = containerInspect.Id;
                if (containerNameRegExp.test(containerInspect.Name)) {
                    serviceContainerIds.push({ serviceId, containerId });
                    envVariables.add(
                        `FEATER__CONTAINER_ID__${serviceId.toUpperCase()}`,
                        containerId,
                    );
                    featerVariables.add(
                        `container_id__${serviceId.toLowerCase()}`,
                        containerId,
                    );
                }
            }
        }
        logger.info(
            `Added environmental variables:${
                envVariables.isEmpty()
                    ? ' none'
                    : '\n' + JSON.stringify(envVariables.toMap(), null, 2)
            }`,
        );
        logger.info(
            `Added Feater variables:${
                featerVariables.isEmpty()
                    ? ' none'
                    : '\n' + JSON.stringify(featerVariables.toMap(), null, 2)
            }`,
        );
        logger.info(
            `Service ID to container ID map:\n${JSON.stringify(
                serviceContainerIds,
                null,
                2,
            )}`,
        );

        return {
            serviceContainerIds,
            envVariables,
            featerVariables,
        } as GetContainerIdsCommandResultInterface;
    }
}
