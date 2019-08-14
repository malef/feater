import {spawn} from 'child_process';
import {Injectable} from '@nestjs/common';
import {environment} from './../environments/environment';
import {SpawnHelper} from './helper/spawn-helper.component';
import {CommandLogger} from './logger/command-logger';

@Injectable()
export class VolumeCreator {

    constructor(
        private readonly spawnHelper: SpawnHelper,
    ) {}

    async createVolumeFromTarGzipAsset(
        assetAbsoluteHostPath: string,
        volumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        if (commandLogger) {
            commandLogger.info(`Creating volume.`);
        }
        await this.spawnVolumeCreate(volumeName, workingDirectory, commandLogger);
        if (commandLogger) {
            commandLogger.info(`Extracting asset to volume.`);
        }
        await this.spawnExtractAssetToVolume(assetAbsoluteHostPath, volumeName, workingDirectory, commandLogger);
    }

    async createVolumeFromVolume(
        sourceVolumeName: string,
        destinationVolumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        if (commandLogger) {
            commandLogger.info(`Creating volume.`);
        }
        await this.spawnVolumeCreate(destinationVolumeName, workingDirectory, commandLogger);
        if (commandLogger) {
            commandLogger.info(`Duplicating volume.`);
        }
        await this.spawnDuplicateVolume(sourceVolumeName, destinationVolumeName, workingDirectory, commandLogger);
    }

    async removeVolume(
        volumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        if (commandLogger) {
            commandLogger.info(`Removing volume.`);
        }
        await this.spawnRemoveVolume(volumeName, workingDirectory, commandLogger);
    }

    async inspectVolume(
        volumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        if (commandLogger) {
            commandLogger.info(`Inspecting volume.`);
        }
        await this.spawnInspectVolume(volumeName, workingDirectory, commandLogger);
    }

    protected spawnInspectVolume(
        volumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const spawned = spawn(
                environment.instantiation.dockerBinaryPath,
                ['volume', 'inspect', volumeName],
                {cwd: workingDirectory},
            );

            if (commandLogger) {
                this.spawnHelper.handleSpawned(
                    spawned,
                    commandLogger,
                    resolve,
                    reject,
                    () => {
                        commandLogger.info(`Completed inspecting volume.`);
                    },
                    (exitCode: number) => {
                        commandLogger.error(`Failed to inspect volume.`);
                        commandLogger.error(`Exit code: ${exitCode}`);
                    },
                    (error: Error) => {
                        commandLogger.error(`Failed to inspect volume.`);
                        commandLogger.error(`Error message: ${error.message}`);
                    },
                );

                return;
            }

            this.spawnHelper.handleSpawnedWithoutLogger(
                spawned,
                resolve,
                reject,
            );
        });
    }

    protected spawnVolumeCreate(
        volumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const spawned = spawn(
                environment.instantiation.dockerBinaryPath,
                ['volume', 'create', '--name', volumeName],
                {cwd: workingDirectory},
            );

            if (commandLogger) {
                this.spawnHelper.handleSpawned(
                    spawned,
                    commandLogger,
                    resolve,
                    reject,
                    () => {
                        commandLogger.info(`Completed creating volume.`);
                    },
                    (exitCode: number) => {
                        commandLogger.error(`Failed to create volume.`);
                        commandLogger.error(`Exit code: ${exitCode}`);
                    },
                    (error: Error) => {
                        commandLogger.error(`Failed to create volume.`);
                        commandLogger.error(`Error message: ${error.message}`);
                    },
                );

                return;
            }

            this.spawnHelper.handleSpawnedWithoutLogger(
                spawned,
                resolve,
                reject,
            );
        });
    }

    protected spawnExtractAssetToVolume(
        absoluteUploadedAssetHostPath: string,
        volumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const spawned = spawn(
                environment.instantiation.dockerBinaryPath,
                [
                    'run', '--rm',
                    '-v', `${absoluteUploadedAssetHostPath}:/source.tar.gz`,
                    '-v', `${volumeName}:/target`,
                    'alpine', 'ash', '-c', 'tar -zxvf /source.tar.gz -C /target/',
                ],
                {cwd: workingDirectory},
            );

            if (commandLogger) {
                this.spawnHelper.handleSpawned(
                    spawned,
                    commandLogger,
                    resolve,
                    reject,
                    () => {
                        commandLogger.info(`Completed extracting asset to volume.`);
                    },
                    (exitCode: number) => {
                        commandLogger.error(`Failed to copy files from asset to volume.`);
                        commandLogger.error(`Exit code: ${exitCode}`);
                    },
                    (error: Error) => {
                        commandLogger.error(`Failed to copy files from asset to volume.`);
                        commandLogger.error(`Error message: ${error.message}`);
                    },
                );

                return;
            }

            this.spawnHelper.handleSpawnedWithoutLogger(
                spawned,
                resolve,
                reject,
            );
        });
    }

    protected spawnDuplicateVolume(
        sourceVolumeName: string,
        destinationVolumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const spawned = spawn(
                environment.instantiation.dockerBinaryPath,
                [
                    'run', '--rm',
                    '-v', `${sourceVolumeName}:/source`,
                    '-v', `${destinationVolumeName}:/target`,
                    'alpine', 'ash', '-c', 'cp -rvT /source /target',
                ],
                {cwd: workingDirectory},
            );

            if (commandLogger) {
                this.spawnHelper
                    .handleSpawned(
                        spawned,
                        commandLogger,
                        resolve,
                        reject,
                        () => {
                            commandLogger.info(`Completed extracting asset to volume.`);
                        },
                        (exitCode: number) => {
                            commandLogger.error(`Failed to copy files from asset to volume.`);
                            commandLogger.error(`Exit code: ${exitCode}`);
                        },
                        (error: Error) => {
                            commandLogger.error(`Failed to copy files from asset to volume.`);
                            commandLogger.error(`Error message: ${error.message}`);
                        },
                    );

                return;
            }

            this.spawnHelper.handleSpawnedWithoutLogger(
                spawned,
                resolve,
                reject,
            );
        });
    }

    protected spawnRemoveVolume(
        volumeName: string,
        workingDirectory: string,
        commandLogger?: CommandLogger,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const spawned = spawn(
                environment.instantiation.dockerBinaryPath,
                ['volume', 'rm', volumeName],
                {cwd: workingDirectory},
            );

            if (commandLogger) {
                this.spawnHelper
                    .handleSpawned(
                        spawned,
                        commandLogger,
                        resolve,
                        reject,
                        () => {
                            commandLogger.info(`Completed removing volume.`);
                        },
                        (exitCode: number) => {
                            commandLogger.error(`Failed to remove volume.`);
                            commandLogger.error(`Exit code: ${exitCode}`);
                        },
                        (error: Error) => {
                            commandLogger.error(`Failed to remove volume.`);
                            commandLogger.error(`Error message: ${error.message}`);
                        },
                    );

                return;
            }

            this.spawnHelper.handleSpawnedWithoutLogger(
                spawned,
                resolve,
                reject,
            );
        });
    }
}
