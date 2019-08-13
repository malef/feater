import {Injectable} from '@nestjs/common';
import {AssetRepository} from '../../../persistence/repository/asset.repository';
import {SimpleCommandExecutorComponentInterface} from '../../executor/simple-command-executor-component.interface';
import {AssetHelper} from '../../helper/asset-helper.component';
import {SimpleCommand} from '../../executor/simple-command';
import {EnvVariablesSet} from '../../sets/env-variables-set';
import {CreateVolumeFromAssetCommandResultInterface} from './command-result.interface';
import {CreateVolumeFromAssetCommand} from './command';
import {FeaterVariablesSet} from '../../sets/feater-variables-set';
import {AssetVolumeStatus} from '../../../persistence/interface/asset.interface';
import {VolumeCreator} from '../../volume-creator.service';

@Injectable()
export class CreateVolumeFromAssetCommandExecutorComponent implements SimpleCommandExecutorComponentInterface {

    constructor(
        private readonly assetRepository: AssetRepository,
        private readonly assetHelper: AssetHelper,
        private readonly volumeCreator: VolumeCreator,
    ) {}

    supports(command: SimpleCommand): boolean {
        return (command instanceof CreateVolumeFromAssetCommand);
    }

    async execute(command: SimpleCommand): Promise<any> {
        const typedCommand = command as CreateVolumeFromAssetCommand;
        const logger = typedCommand.commandLogger;

        logger.info(`Asset ID: ${typedCommand.assetId}`);
        logger.info(`Volume ID: ${typedCommand.volumeId}`);

        const asset = await this.assetHelper.findUploadedById(typedCommand.assetId);

        if (!asset.volumeName || asset.volumeStatus !== AssetVolumeStatus.ready) {
            logger.error('Asset source volume not ready.');

            throw new Error('Asset source volume not ready.');
        }

        const sourceVolumeName = asset.volumeName;
        const destinationVolumeName = `${typedCommand.containerNamePrefix}_${typedCommand.volumeId}`;

        logger.info(`Source volume name: ${sourceVolumeName}`);
        logger.info(`Destination volume name: ${destinationVolumeName}`);

        await this.volumeCreator.createVolumeFromVolume(
            asset.volumeName,
            destinationVolumeName,
            typedCommand.absoluteGuestInstanceDirPath,
            logger,
        );

        const envVariables = new EnvVariablesSet();
        envVariables.add(
            `FEATER__ASSET_VOLUME__${typedCommand.volumeId.toUpperCase()}`,
            destinationVolumeName,
        );
        logger.info(`Added environmental variables:${
            envVariables.isEmpty()
                ? ' none'
                : '\n' + JSON.stringify(envVariables.toMap(), null, 2)
            }`);

        const featerVariables = new FeaterVariablesSet();
        featerVariables.add(
            `asset_volume__${typedCommand.volumeId.toLowerCase()}`,
            destinationVolumeName,
        );
        logger.info(`Added Feater variables:${
            featerVariables.isEmpty()
                ? ' none'
                : '\n' + JSON.stringify(featerVariables.toMap(), null, 2)
        }`);

        return {envVariables, featerVariables} as CreateVolumeFromAssetCommandResultInterface;
    }

}
