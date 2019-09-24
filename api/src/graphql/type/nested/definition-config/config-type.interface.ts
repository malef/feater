import {SourceTypeInterface} from './source-type.interface';
import {ProxiedPortTypeInterface} from './proxied-port-type.interface';
import {SummaryItemTypeInterface} from './summary-item-type.interface';
import {ComposeFileTypeInterface} from './compose-file-type.interface';
import {EnvVariableTypeInterface} from './env-variable-type.interface';
import {VolumeTypeInterface} from './volume-type.interface';
import {ActionTypeInterface} from './action-type.interface';
import {DownloadableTypeInterface} from './downloadable-type.interface';

export interface ConfigTypeInterface {
    volumes: VolumeTypeInterface[];
    sources: SourceTypeInterface[];
    proxiedPorts: ProxiedPortTypeInterface[];
    envVariables: EnvVariableTypeInterface[];
    composeFiles: ComposeFileTypeInterface[];
    actions: ActionTypeInterface[];
    summaryItems: SummaryItemTypeInterface[];
    downloadables: DownloadableTypeInterface[];
}
