import * as path from 'path';
import {BeforeBuildTaskCommandFactoryInterface} from '../command-factory.interface';
import {InterpolateFileCommand} from './command';
import {ContextAwareCommand} from '../../../executor/context-aware-command';
import {InterpolateFileCommandResultInterface} from './command-result.interface';
import {ActionExecutionContextBeforeBuildTaskInterface} from '../../../action-execution-context/before-build/action-execution-context-before-build-task.interface';
import {ActionExecutionContextSourceInterface} from '../../../action-execution-context/action-execution-context-source.interface';
import {ActionExecutionContext} from '../../../action-execution-context/action-execution-context';
import {ActionExecutionContextInterpolateFileInterface} from '../../../action-execution-context/before-build/action-execution-context-interpolate-file.interface';
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
        beforeBuildTask: ActionExecutionContextBeforeBuildTaskInterface,
        source: ActionExecutionContextSourceInterface,
        actionLogId: string,
        instantiationContext: ActionExecutionContext,
        updateInstance: () => Promise<void>,
    ): CommandType {
        const typedBeforeBuildTask = beforeBuildTask as ActionExecutionContextInterpolateFileInterface;

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
                (beforeBuildTask as ActionExecutionContextInterpolateFileInterface).interpolatedText = result.interpolatedText;
            },
        );
    }

}
