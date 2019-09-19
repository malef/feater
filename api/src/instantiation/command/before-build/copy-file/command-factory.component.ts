import * as path from 'path';
import {BeforeBuildTaskCommandFactoryInterface} from '../command-factory.interface';
import {CopyFileCommand} from './command';
import {ContextAwareCommand} from '../../../executor/context-aware-command.interface';
import {InstantiationContextBeforeBuildTaskInterface} from '../../../instantiation-context/before-build/instantiation-context-before-build-task.interface';
import {InstantiationContextSourceInterface} from '../../../instantiation-context/instantiation-context-source.interface';
import {InstantiationContext} from '../../../instantiation-context/instantiation-context';
import {InstantiationContextCopyFileInterface} from '../../../instantiation-context/before-build/instantiation-context-copy-file.interface';
import {CommandType} from '../../../executor/command.type';
import {Injectable} from '@nestjs/common';

@Injectable()
export class CopyFileCommandFactoryComponent implements BeforeBuildTaskCommandFactoryInterface {

    protected readonly TYPE = 'copy';

    supportsType(type: string): boolean {
        return this.TYPE === type;
    }

    createCommand(
        type: string,
        beforeBuildTask: InstantiationContextBeforeBuildTaskInterface,
        source: InstantiationContextSourceInterface,
        actionLogId: string,
        instantiationContext: InstantiationContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        const typedBeforeBuildTask = beforeBuildTask as InstantiationContextCopyFileInterface;

        return new ContextAwareCommand(
            actionLogId,
            instantiationContext.id,
            instantiationContext.hash,
            `Copy file for source \`${source.id}\``,
            () => new CopyFileCommand(
                path.join(source.paths.dir.absolute.guest, typedBeforeBuildTask.sourceRelativePath),
                path.join(source.paths.dir.absolute.guest, typedBeforeBuildTask.destinationRelativePath),
            ),
        );
    }

}
