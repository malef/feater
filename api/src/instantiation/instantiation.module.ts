import {Module} from '@nestjs/common';
import {LoggerModule} from '../logger/logger.module';
import {PersistenceModule} from '../persistence/persistence.module';
import {Instantiator} from './instantiator.service';
import {Modificator} from './modificator.service';
import {InterpolationHelper} from './helper/interpolation-helper.component';
import {ContainerStateChecker} from './container-state-checker.service';
import {ContainerInfoChecker} from './container-info-checker.service';
import {SpawnHelper} from './helper/spawn-helper.component';
import {AssetHelper} from './helper/asset-helper.component';
import {ConnectToNetworkCommandExecutorComponent} from './command/connect-containers-to-network/command-executor.component';
import {CopyFileCommandExecutorComponent} from './command/before-build/copy-file/command-executor.component';
import {CreateDirectoryCommandExecutorComponent} from './command/create-directory/command-executor.component';
import {CloneSourceCommandExecutorComponent} from './command/clone-source/command-executor.component';
import {ResetSourceCommandExecutorComponent} from './command/reset-source/command-executor.component';
import {GetContainerIdsCommandExecutorComponent} from './command/get-container-id/command-executor.component';
import {InterpolateFileCommandExecutorComponent} from './command/before-build/interpolate-file/command-executor.component';
import {ParseDockerComposeCommandExecutorComponent} from './command/parse-docker-compose/command-executor.component';
import {PrepareSourceEnvVarsCommandExecutorComponent} from './command/prepare-source-env-vars/command-executor.component';
import {PrepareProxyDomainCommandExecutorComponent} from './command/prepare-port-domain/command-executor.component';
import {ConfigureProxyDomainCommandExecutorComponent} from './command/configure-proxy-domain/command-executor.component';
import {PrepareSummaryItemsCommandExecutorComponent} from './command/prepare-summary-items/command-executor.component';
import {RunDockerComposeCommandExecutorComponent} from './command/run-docker-compose/command-executor.component';
import {ExecuteHostCmdCommandExecutorComponent} from './command/after-build/execute-host-cmd/command-executor.component';
import {ExecuteServiceCmdCommandExecutorComponent} from './command/after-build/execute-service-cmd/command-executor.component';
import {CopyAssetIntoContainerCommandExecutorComponent} from './command/after-build/copy-asset-into-container/command-executor.component';
import {CreateVolumeFromAssetCommandExecutorComponent} from './command/create-volume-from-asset/command-executor.component';
import {CopyFileCommandFactoryComponent} from './command/before-build/copy-file/command-factory.component';
import {InterpolateFileCommandFactoryComponent} from './command/before-build/interpolate-file/command-factory.component';
import {CopyAssetIntoContainerCommandFactoryComponent} from './command/after-build/copy-asset-into-container/command-factory.component';
import {ExecuteHostCmdCommandFactoryComponent} from './command/after-build/execute-host-cmd/command-factory.component';
import {ExecuteServiceCmdCommandFactoryComponent} from './command/after-build/execute-service-cmd/command-factory.component';
import {ContextAwareCommandExecutorComponent} from './executor/context-aware-command-executor.component';
import {CompositeSimpleCommandExecutorComponent} from './executor/composite-simple-command-executor.component';
import {PathHelper} from './helper/path-helper.component';
import {InstantiationContextFactory} from './instantiation-context-factory.service';
import {EnableProxyDomainsCommandExecutorComponent} from './command/enable-proxy-domains/command-executor.component';
import {CommandsMapExecutorComponent} from './executor/commands-map-executor.component';
import {CommandsListExecutorComponent} from './executor/commands-list-executor.component';
import {CommandExecutorComponent} from './executor/command-executor.component';
import {VariablesPredictor} from './variable/variables-predictor.service';
import {IpAddressChecker} from './ip-address-checker.service';

@Module({
    imports: [
        LoggerModule,
        PersistenceModule,
    ],
    controllers: [],
    providers: [
        ConnectToNetworkCommandExecutorComponent,
        CopyFileCommandExecutorComponent,
        CreateDirectoryCommandExecutorComponent,
        CloneSourceCommandExecutorComponent,
        ResetSourceCommandExecutorComponent,
        GetContainerIdsCommandExecutorComponent,
        InterpolateFileCommandExecutorComponent,
        ParseDockerComposeCommandExecutorComponent,
        PrepareSourceEnvVarsCommandExecutorComponent,
        PrepareProxyDomainCommandExecutorComponent,
        ConfigureProxyDomainCommandExecutorComponent,
        PrepareSummaryItemsCommandExecutorComponent,
        RunDockerComposeCommandExecutorComponent,
        ExecuteHostCmdCommandExecutorComponent,
        ExecuteServiceCmdCommandExecutorComponent,
        CopyAssetIntoContainerCommandExecutorComponent,
        CreateVolumeFromAssetCommandExecutorComponent,
        EnableProxyDomainsCommandExecutorComponent,
        ContainerInfoChecker,
        ContainerStateChecker,
        IpAddressChecker,
        AssetHelper,
        InterpolationHelper,
        SpawnHelper,
        PathHelper,
        Instantiator,
        Modificator,
        InstantiationContextFactory,
        CopyFileCommandFactoryComponent,
        InterpolateFileCommandFactoryComponent,
        CopyAssetIntoContainerCommandFactoryComponent,
        ExecuteHostCmdCommandFactoryComponent,
        ExecuteServiceCmdCommandFactoryComponent,
        CommandExecutorComponent,
        CommandsMapExecutorComponent,
        CommandsListExecutorComponent,
        ContextAwareCommandExecutorComponent,
        CompositeSimpleCommandExecutorComponent,
        VariablesPredictor,
    ],
    exports: [
        Instantiator,
        Modificator,
        ContainerStateChecker,
        IpAddressChecker,
        AssetHelper,
        VariablesPredictor,
        PathHelper,
    ],
})
export class InstantiationModule {}
