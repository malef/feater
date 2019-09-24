import {ActionExecutionContextPathsInterface} from './action-execution-context-paths.interface';
import {ActionExecutionContextSourceInterface} from './action-execution-context-source.interface';
import {ActionExecutionContextVolumeInterface} from './action-execution-context-volume.interface';
import {ActionExecutionContextServiceInterface} from './action-execution-context-service.interface';
import {ActionExecutionContextProxiedPortInterface} from './action-execution-context-proxied-port.interface';
import {ActionExecutionContextAfterBuildTaskInterface} from './after-build/action-execution-context-after-build-task.interface';
import {ActionExecutionContextComposeFileInterface} from './action-execution-context-compose-file.interface';
import {EnvVariablesSet} from '../sets/env-variables-set';
import {FeaterVariablesSet} from '../sets/feater-variables-set';
import {SummaryItemsSet} from '../sets/summary-items-set';
import * as _ from 'lodash';
import {ActionExecutionContextDownloadableInterface} from './action-execution-context-downloadable.interface';

export class ActionExecutionContext {

    paths: ActionExecutionContextPathsInterface;
    composeProjectName: string;
    sources: ActionExecutionContextSourceInterface[];
    volumes: ActionExecutionContextVolumeInterface[];
    services: ActionExecutionContextServiceInterface[];
    proxiedPorts: ActionExecutionContextProxiedPortInterface[];
    afterBuildTasks: ActionExecutionContextAfterBuildTaskInterface[];
    composeFiles: ActionExecutionContextComposeFileInterface[];
    envVariables: EnvVariablesSet;
    featerVariables: FeaterVariablesSet;
    nonInterpolatedSummaryItems: SummaryItemsSet;
    summaryItems: SummaryItemsSet;
    downloadables: ActionExecutionContextDownloadableInterface[];

    constructor(
        readonly id: string,
        readonly hash: string,
    ) {
        this.envVariables = new EnvVariablesSet();
        this.featerVariables = new FeaterVariablesSet();
        this.nonInterpolatedSummaryItems = new SummaryItemsSet();
        this.summaryItems = new SummaryItemsSet();
    }

    findSource(sourceId: string): ActionExecutionContextSourceInterface {
        const source = _.find(this.sources, {id: sourceId});
        if (!source) {
            throw new Error();
        }

        return source as ActionExecutionContextSourceInterface;
    }

    findService(serviceId: string): ActionExecutionContextServiceInterface {
        const service = _.find(this.services, {id: serviceId});
        if (!service) {
            throw new Error();
        }

        return service as ActionExecutionContextServiceInterface;
    }

    mergeEnvVariablesSet(envVariablesSet: EnvVariablesSet) {
        this.envVariables = this.envVariables.merge(envVariablesSet);
    }

    mergeFeaterVariablesSet(featerVariablesSet: FeaterVariablesSet) {
        this.featerVariables = this.featerVariables.merge(featerVariablesSet);
    }

}
