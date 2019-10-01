import { Injectable } from '@nestjs/common';
import { ConfigTypeInterface } from '../type/nested/definition-config/config-type.interface';
import { SourceTypeInterface } from '../type/nested/definition-config/source-type.interface';
import { SourceReferenceTypeInterface } from '../type/nested/definition-config/source-reference-type.interface';
import { ProxiedPortTypeInterface } from '../type/nested/definition-config/proxied-port-type.interface';
import { SummaryItemTypeInterface } from '../type/nested/definition-config/summary-item-type.interface';
import { ComposeFileTypeInterface } from '../type/nested/definition-config/compose-file-type.interface';
import { EnvVariableTypeInterface } from '../type/nested/definition-config/env-variable-type.interface';
import {
    BeforeBuildTaskTypeInterface,
    CopyBeforeBuildTaskTypeInterface,
    InterpolateBeforeBuildTaskTypeInterface,
} from '../type/nested/definition-config/before-build-task-type.interface';
import {
    AfterBuildTaskTypeInterfaces,
    CopyAssetIntoContainerAfterBuildTaskTypeInterface,
    ExecuteHostCommandAfterBuildTaskTypeInterface,
    ExecuteServiceCommandAfterBuildTaskTypeInterface,
} from '../type/nested/definition-config/after-build-task-type.interface';
import { VolumeTypeInterface } from '../type/nested/definition-config/volume-type.interface';
import { ActionTypeInterface } from '../type/nested/definition-config/action-type.interface';
import { DownloadableTypeInterface } from '../type/nested/definition-config/downloadable-type.interface';

@Injectable()
export class DefinitionConfigMapper {
    public map(config: any): ConfigTypeInterface {
        const mappedSources: SourceTypeInterface[] = [];
        for (const source of config.sources) {
            mappedSources.push(this.mapSource(source));
        }

        const mappedVolumes: VolumeTypeInterface[] = [];
        for (const volume of config.volumes) {
            mappedVolumes.push(this.mapVolume(volume));
        }

        const mappedProxiedPorts: ProxiedPortTypeInterface[] = [];
        for (const proxiedPort of config.proxiedPorts) {
            mappedProxiedPorts.push(this.mapProxiedPort(proxiedPort));
        }

        const mappedEnvVariables: EnvVariableTypeInterface[] = [];
        if (config.envVariables) {
            for (const envVariable of config.envVariables) {
                mappedEnvVariables.push(this.mapEnvVariable(envVariable));
            }
        }

        const mappedComposeFiles: ComposeFileTypeInterface[] = [];
        if (config.composeFiles) {
            for (const composeFile of config.composeFiles) {
                mappedComposeFiles.push(this.mapComposeFile(composeFile));
            }
        } else {
            mappedComposeFiles.push(this.mapComposeFile(config.composeFile));
        }

        const mappedActions: ActionTypeInterface[] = [];
        for (const action of config.actions) {
            const mappedAfterBuildTasks: AfterBuildTaskTypeInterfaces[] = [];
            for (const afterBuildTask of action.afterBuildTasks) {
                mappedAfterBuildTasks.push(
                    this.mapAfterBuildTask(afterBuildTask),
                );
            }
            mappedActions.push({
                id: action.id,
                name: action.name,
                type: action.type,
                afterBuildTasks: mappedAfterBuildTasks,
            });
        }

        const mappedSummaryItems: SummaryItemTypeInterface[] = [];
        for (const summaryItem of config.summaryItems) {
            mappedSummaryItems.push(this.mapSummaryItem(summaryItem));
        }

        const mappedDownloadables: DownloadableTypeInterface[] = [];
        for (const downloadable of config.downloadables) {
            mappedDownloadables.push(this.mapDownloadable(downloadable));
        }

        return {
            sources: mappedSources,
            volumes: mappedVolumes,
            proxiedPorts: mappedProxiedPorts,
            envVariables: mappedEnvVariables,
            composeFiles: mappedComposeFiles,
            actions: mappedActions,
            summaryItems: mappedSummaryItems,
            downloadables: mappedDownloadables,
        } as ConfigTypeInterface;
    }

    protected mapSource(source: any): SourceTypeInterface {
        const mappedBeforeBuildTasks: BeforeBuildTaskTypeInterface[] = [];

        if (source.beforeBuildTasks) {
            for (const beforeBuildTask of source.beforeBuildTasks) {
                mappedBeforeBuildTasks.push(
                    this.mapBeforeBuildTask(beforeBuildTask),
                );
            }
        }

        return {
            id: source.id,
            cloneUrl: source.cloneUrl,
            reference: this.mapSourceReference(source.reference),
            beforeBuildTasks: mappedBeforeBuildTasks,
        } as SourceTypeInterface;
    }

    protected mapVolume(volume: any): VolumeTypeInterface {
        return {
            id: volume.id,
            assetId: volume.assetId,
        } as VolumeTypeInterface;
    }

    protected mapBeforeBuildTask(
        beforeBuildTask: any,
    ): BeforeBuildTaskTypeInterface {
        switch (beforeBuildTask.type) {
            case 'copy':
                return {
                    type: beforeBuildTask.type,
                    sourceRelativePath: beforeBuildTask.sourceRelativePath,
                    destinationRelativePath:
                        beforeBuildTask.destinationRelativePath,
                } as CopyBeforeBuildTaskTypeInterface;

            case 'interpolate':
                return {
                    type: beforeBuildTask.type,
                    relativePath: beforeBuildTask.relativePath,
                } as InterpolateBeforeBuildTaskTypeInterface;

            default:
                throw new Error();
        }
    }

    protected mapAfterBuildTask(
        afterBuildTask: any,
    ): AfterBuildTaskTypeInterfaces {
        let mapped: AfterBuildTaskTypeInterfaces;
        const commonMapped: any = {};

        commonMapped.type = afterBuildTask.type;
        if (afterBuildTask.id) {
            commonMapped.id = afterBuildTask.id;
        }
        if (afterBuildTask.dependsOn) {
            commonMapped.dependsOn = afterBuildTask.dependsOn;
        }

        switch (afterBuildTask.type) {
            case 'executeHostCommand':
                mapped = {
                    ...commonMapped,
                    customEnvVariables: afterBuildTask.customEnvVariables,
                    inheritedEnvVariables: afterBuildTask.inheritedEnvVariables,
                    command: afterBuildTask.command,
                } as ExecuteHostCommandAfterBuildTaskTypeInterface;

                break;

            case 'executeServiceCommand':
                mapped = {
                    ...commonMapped,
                    serviceId: afterBuildTask.serviceId,
                    customEnvVariables: afterBuildTask.customEnvVariables,
                    inheritedEnvVariables: afterBuildTask.inheritedEnvVariables,
                    command: afterBuildTask.command,
                } as ExecuteServiceCommandAfterBuildTaskTypeInterface;

                break;

            case 'copyAssetIntoContainer':
                mapped = {
                    ...commonMapped,
                    serviceId: afterBuildTask.serviceId,
                    assetId: afterBuildTask.assetId,
                    destinationPath: afterBuildTask.destinationPath,
                } as CopyAssetIntoContainerAfterBuildTaskTypeInterface;

                break;

            default:
                throw new Error();
        }

        return mapped as AfterBuildTaskTypeInterfaces;
    }

    protected mapSourceReference(reference: any): SourceReferenceTypeInterface {
        return {
            type: reference.type,
            name: reference.name,
        } as SourceReferenceTypeInterface;
    }

    protected mapProxiedPort(proxiedPort: any): ProxiedPortTypeInterface {
        return {
            id: proxiedPort.id,
            serviceId: proxiedPort.serviceId,
            port: proxiedPort.port,
            name: proxiedPort.name,
        } as ProxiedPortTypeInterface;
    }

    protected mapSummaryItem(summaryItem: any): SummaryItemTypeInterface {
        return {
            name: summaryItem.name,
            value: summaryItem.value,
        } as SummaryItemTypeInterface;
    }

    protected mapDownloadable(downloadable: any): DownloadableTypeInterface {
        return {
            id: downloadable.id,
            name: downloadable.name,
            serviceId: downloadable.serviceId,
            absolutePath: downloadable.absolutePath,
        } as DownloadableTypeInterface;
    }

    protected mapEnvVariable(envVariable: any): EnvVariableTypeInterface {
        return envVariable as EnvVariableTypeInterface;
    }

    protected mapComposeFile(composeFile: any): ComposeFileTypeInterface {
        return composeFile as ComposeFileTypeInterface;
    }
}
