import { Injectable } from '@nestjs/common';
import { PathHelper } from './helper/path-helper.component';
import { environment } from '../environments/environment';
import { ActionExecutionContextBeforeBuildTaskInterface } from './action-execution-context/before-build/action-execution-context-before-build-task.interface';
import { AfterBuildTaskTypeInterface } from '../graphql/type/nested/definition-config/after-build-task-type.interface';
import { FeaterVariablesSet } from './sets/feater-variables-set';
import { ActionExecutionContext } from './action-execution-context/action-execution-context';
import { EnvVariablesSet } from './sets/env-variables-set';
import { SummaryItemsSet } from './sets/summary-items-set';

@Injectable()
export class ActionExecutionContextFactory {
    constructor(protected readonly pathHelper: PathHelper) {}

    create(
        definitionConfig: any,
        id: string,
        hash: string,
        actionId: string,
    ): ActionExecutionContext {
        const instantiationContext = new ActionExecutionContext(id, hash);

        instantiationContext.composeProjectName = `${environment.instantiation.containerNamePrefix}${instantiationContext.hash}`;
        instantiationContext.paths = {
            dir: this.pathHelper.getInstancePaths(hash),
        };

        instantiationContext.volumes = [];
        for (const volumeConfig of definitionConfig.volumes) {
            instantiationContext.volumes.push({
                id: volumeConfig.id,
                assetId: volumeConfig.assetId,
                paths: {
                    extractDir: this.pathHelper.getAssetExtractPaths(
                        hash,
                        volumeConfig.assetId,
                    ),
                },
            });
        }

        instantiationContext.sources = [];
        for (const sourceConfig of definitionConfig.sources) {
            instantiationContext.sources.push({
                id: sourceConfig.id,
                cloneUrl: sourceConfig.cloneUrl,
                reference: {
                    type: sourceConfig.reference.type,
                    name: sourceConfig.reference.name,
                },
                paths: {
                    dir: this.pathHelper.getSourcePaths(hash, sourceConfig.id),
                },
                beforeBuildTasks: sourceConfig.beforeBuildTasks.map(
                    beforeBuildTaskConfig =>
                        beforeBuildTaskConfig as ActionExecutionContextBeforeBuildTaskInterface,
                ),
            });
        }

        instantiationContext.proxiedPorts = [];
        for (const proxiedPort of definitionConfig.proxiedPorts) {
            instantiationContext.proxiedPorts.push({
                id: proxiedPort.id,
                serviceId: proxiedPort.serviceId,
                name: proxiedPort.name,
                port: proxiedPort.port,
            });
        }

        instantiationContext.services = [];

        instantiationContext.composeFiles = [];
        for (const composeFileConfig of definitionConfig.composeFiles) {
            instantiationContext.composeFiles.push(composeFileConfig);
        }

        instantiationContext.nonInterpolatedSummaryItems = SummaryItemsSet.fromList(
            definitionConfig.summaryItems,
        );

        instantiationContext.downloadables = [];
        for (const downloadable of definitionConfig.downloadables) {
            instantiationContext.downloadables.push({
                id: downloadable.id,
                name: downloadable.name,
                serviceId: downloadable.serviceId,
                absolutePath: downloadable.absolutePath,
            });
        }

        const envVariables = EnvVariablesSet.fromList(
            definitionConfig.envVariables,
        );
        const featerVariables = new FeaterVariablesSet();

        // Add Feater variables for env variables provided in definition.
        for (const envVariable of envVariables.toList()) {
            featerVariables.add(
                `env__${envVariable.name.toLowerCase()}`,
                envVariable.value,
            );
        }

        // Add some basic Feater variables and env variables.
        envVariables.add('FEATER__INSTANCE_ID', instantiationContext.id);
        featerVariables.add('instance_id', instantiationContext.id);
        envVariables.add('FEATER__INSTANCE_HASH', instantiationContext.hash);
        featerVariables.add('instance_hash', instantiationContext.hash);

        envVariables.add(
            'COMPOSE_PROJECT_NAME',
            instantiationContext.composeProjectName,
        );
        featerVariables.add(
            'compose_project_name',
            instantiationContext.composeProjectName,
        );

        instantiationContext.mergeEnvVariablesSet(envVariables);
        instantiationContext.mergeFeaterVariablesSet(featerVariables);

        instantiationContext.afterBuildTasks = [];
        const action = this.findAction(definitionConfig, actionId);
        for (const afterBuildTask of action.afterBuildTasks) {
            instantiationContext.afterBuildTasks.push(
                afterBuildTask as AfterBuildTaskTypeInterface,
            );
        }

        return instantiationContext;
    }

    protected findAction(definitionConfig: any, actionId: string): any {
        for (const action of definitionConfig.actions) {
            if (actionId === action.id) {
                return action;
            }
        }

        throw new Error(`Invalid action '${actionId}'.`);
    }
}
