import {InstantiationContextPathsInterface} from './instantiation-context-paths.interface';
import {InstantiationContextSourceInterface} from './instantiation-context-source.interface';
import {InstantiationContextVolumeInterface} from './instantiation-context-volume.interface';
import {InstantiationContextServiceInterface} from './instantiation-context-service.interface';
import {InstantiationContextProxiedPortInterface} from './instantiation-context-proxied-port.interface';
import {InstantiationContextAfterBuildTaskInterface} from './after-build/instantiation-context-after-build-task.interface';
import {InstantiationContextComposeFileInterface} from './instantiation-context-compose-file.interface';
import {EnvVariablesSet} from '../sets/env-variables-set';
import {FeaterVariablesSet} from '../sets/feater-variables-set';
import {SummaryItemsSet} from '../sets/summary-items-set';
import * as _ from 'lodash';

export class InstantiationContext {

    paths: InstantiationContextPathsInterface;
    composeProjectName: string;
    sources: InstantiationContextSourceInterface[];
    volumes: InstantiationContextVolumeInterface[];
    services: InstantiationContextServiceInterface[];
    proxiedPorts: InstantiationContextProxiedPortInterface[];
    afterBuildTasks: InstantiationContextAfterBuildTaskInterface[];
    composeFiles: InstantiationContextComposeFileInterface[];
    envVariables: EnvVariablesSet;
    featerVariables: FeaterVariablesSet;
    nonInterpolatedSummaryItems: SummaryItemsSet;
    summaryItems: SummaryItemsSet;

    constructor(
        readonly id: string,
        readonly hash: string,
    ) {
        this.envVariables = new EnvVariablesSet();
        this.featerVariables = new FeaterVariablesSet();
        this.nonInterpolatedSummaryItems = new SummaryItemsSet();
        this.summaryItems = new SummaryItemsSet();
    }

    findSource(sourceId: string): InstantiationContextSourceInterface {
        const source = _.find(this.sources, {id: sourceId});
        if (!source) {
            throw new Error();
        }

        return source as InstantiationContextSourceInterface;
    }

    findService(serviceId: string): InstantiationContextServiceInterface {
        const service = _.find(this.services, {id: serviceId});
        if (!service) {
            throw new Error();
        }

        return service as InstantiationContextServiceInterface;
    }

    mergeEnvVariablesSet(envVariablesSet: EnvVariablesSet) {
        this.envVariables = this.envVariables.merge(envVariablesSet);
    }

    mergeFeaterVariablesSet(featerVariablesSet: FeaterVariablesSet) {
        this.featerVariables = this.featerVariables.merge(featerVariablesSet);
    }

}
