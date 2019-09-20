import {AfterBuildTaskCommandFactoryInterface} from '../command-factory.interface';
import {CopyAssetIntoContainerCommand} from './command';
import {InstantiationContextAfterBuildTaskInterface} from '../../../instantiation-context/after-build/instantiation-context-after-build-task.interface';
import {InstantiationContext} from '../../../instantiation-context/instantiation-context';
import {InstantiationContextCopyAssetIntoContainerInterface} from '../../../instantiation-context/after-build/instantiation-context-copy-asset-into-container.interface';
import {ContextAwareCommand} from '../../../executor/context-aware-command';
import {CommandType} from '../../../executor/command.type';
import {Injectable} from '@nestjs/common';

@Injectable()
export class CopyAssetIntoContainerCommandFactoryComponent implements AfterBuildTaskCommandFactoryInterface {

    protected readonly TYPE = 'copyAssetIntoContainer';

    supportsType(type: string): boolean {
        return this.TYPE === type;
    }

    createCommand(
        type: string,
        afterBuildTask: InstantiationContextAfterBuildTaskInterface,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        const typedAfterBuildTask = afterBuildTask as InstantiationContextCopyAssetIntoContainerInterface;

        return new ContextAwareCommand(
            actionLogId,
            instantiationContext.id,
            instantiationContext.hash,
            `Copy asset \`${typedAfterBuildTask.assetId}\` for service \`${typedAfterBuildTask.serviceId}\``,
            () => {
                const service = instantiationContext.findService(typedAfterBuildTask.serviceId);

                return new CopyAssetIntoContainerCommand(
                    typedAfterBuildTask.serviceId,
                    typedAfterBuildTask.assetId,
                    typedAfterBuildTask.destinationPath,
                    service.containerId,
                    instantiationContext.paths.dir.absolute.guest,
                );
            },
        );
    }

}
