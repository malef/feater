import * as path from 'path';
import {BeforeBuildTaskCommandFactoryInterface} from '../command-factory.interface';
import {InterpolateFileCommand} from './command';
import {ContextAwareCommand} from '../../../executor/context-aware-command';
import {InterpolateFileCommandResultInterface} from './command-result.interface';
import {InstantiationContextBeforeBuildTaskInterface} from '../../../instantiation-context/before-build/instantiation-context-before-build-task.interface';
import {InstantiationContextSourceInterface} from '../../../instantiation-context/instantiation-context-source.interface';
import {InstantiationContext} from '../../../instantiation-context/instantiation-context';
import {InstantiationContextInterpolateFileInterface} from '../../../instantiation-context/before-build/instantiation-context-interpolate-file.interface';
import {FeaterVariablesSet} from '../../../sets/feater-variables-set';
import {CommandType} from '../../../executor/command.type';
import {Injectable} from '@nestjs/common';

@Injectable()
export class InterpolateFileCommandFactoryComponent implements BeforeBuildTaskCommandFactoryInterface {

    protected readonly TYPE = 'interpolate';

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
        const typedBeforeBuildTask = beforeBuildTask as InstantiationContextInterpolateFileInterface;

        return new ContextAwareCommand(
            actionLogId,
            instantiationContext.id,
            instantiationContext.hash,
            `Interpolate file for source \`${source.id}\``,
            () => new InterpolateFileCommand(
                instantiationContext.featerVariables,
                path.join(source.paths.dir.absolute.guest, typedBeforeBuildTask.relativePath),
            ),
            async (result: InterpolateFileCommandResultInterface): Promise<void> => {
                (beforeBuildTask as InstantiationContextInterpolateFileInterface).interpolatedText = result.interpolatedText;
            },
        );
    }

}
