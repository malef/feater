import {Injectable} from '@nestjs/common';
import * as split from 'split';
import {LoggerInterface} from '../../logger/logger-interface';
import {ChildProcess} from "child_process";

@Injectable()
export class SpawnHelper {
    handleSpawned(
        spawned: ChildProcess,
        logger: LoggerInterface,
        resolve: (payload?: any) => void,
        reject: (error?: any) => void,
        successfulExitHandler: () => void,
        failedExitHandler: (exitCode: number) => void,
        errorHandler: (error: Error) => void,
    ): void {
        spawned.stdout
            .pipe(split())
            .on('data', (line: string) => { logger.info(line, {}); });

        spawned.stderr
            .pipe(split())
            .on('data', (line: string) => { logger.error(line.toString(), {}); });

        this.handleSpawnedWithoutLogger(
            spawned,
            resolve,
            reject,
            successfulExitHandler,
            failedExitHandler,
            errorHandler,
        );
    }

    handleSpawnedWithoutLogger(
        spawned: ChildProcess,
        resolve: (payload?: any) => void,
        reject: (error?: any) => void,
        successfulExitHandler?: () => void,
        failedExitHandler?: (exitCode: number) => void,
        errorHandler?: (error: Error) => void,
    ): void {
        spawned.on('error', error => {
            if (errorHandler) {
                errorHandler(error);
            }
            reject(error);
        });

        const handleExit = exitCode => {
            if (0 !== exitCode) {
                if (failedExitHandler) {
                    failedExitHandler(exitCode);
                }
                reject(exitCode);

                return;
            }

            if (successfulExitHandler) {
                successfulExitHandler();
            }
            resolve();
        };

        spawned.on('exit', handleExit);
        spawned.on('close', handleExit);
    }
}
