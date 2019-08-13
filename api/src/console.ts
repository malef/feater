import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from './app.module';
import {INestApplicationContext} from '@nestjs/common';
import {AssetRepository} from './persistence/repository/asset.repository';
import * as fileType from 'file-type';
import * as readChunk from 'read-chunk';
import {VolumeCreator} from './instantiation/volume-creator.service';
import {AssetVolumeStatus} from './persistence/interface/asset.interface';
import {environment} from './environments/environment';
import {AssetHelper} from './instantiation/helper/asset-helper.component';
import * as fs from 'fs';

enum CommandNames {
    assetRefresh = 'asset:refresh',
}

async function bootstrap() {
    const app: INestApplicationContext = await NestFactory.createApplicationContext(ApplicationModule);

    const commandName = process.argv[2];

    const handleAssetRefresh = async (): Promise<void> => {
        const assetRepository: AssetRepository = app.get(AssetRepository);
        const assetHelper: AssetHelper = app.get(AssetHelper);
        const volumeCreator: VolumeCreator = app.get(VolumeCreator);

        const assets = await assetRepository.find({}, 0, 9999);
        for (const asset of assets) {
            console.log(`Processing asset '${asset.id}'.`);

            const uploadPaths = assetHelper.getUploadPaths(asset);

            if (!fs.existsSync(uploadPaths.absolute.guest) || !fs.lstatSync(uploadPaths.absolute.guest).isFile()) {
                console.log(`Invalid asset file, removing asset.`);
                await assetRepository.getModel().findOneAndRemove({_id: asset._id}).exec();
                console.log(`Asset removed.`);
                continue;
            }

            if (!asset.mimeType) {
                console.log('Determining asset file MIME type.');
                asset.mimeType = fileType(
                    readChunk.sync(
                        uploadPaths.absolute.guest,
                        0,
                        fileType.minimumBytes,
                    ),
                ).mime;
            }

            if (asset.volumeName) {
                console.log(`Removing asset volume '${asset.volumeName}'.`);
                await volumeCreator
                    .inspectVolume(asset.volumeName, environment.guestPaths.build)
                    .then(
                        async () => {
                            await volumeCreator.removeVolume(asset.volumeName, environment.guestPaths.build);
                        },
                        error => {},
                    );
            }

            const volumeName = `${environment.instantiation.assetVolumeNamePrefix}_${asset._id.toHexString()}`;
            if (volumeName !== asset.volumeName) {
                console.log(`Removing asset volume '${volumeName}'.`);
                await volumeCreator
                    .inspectVolume(volumeName, environment.guestPaths.build)
                    .then(
                        async () => {
                            await volumeCreator.removeVolume(volumeName, environment.guestPaths.build);
                        },
                        error => {
                        },
                    );
            }

            asset.volumeName = null;
            asset.volumeStatus = null;
            await asset.save();

            if ('application/gzip' !== asset.mimeType) {
                continue;
            }

            console.log('Creating asset volume.');
            asset.volumeName = volumeName;
            asset.volumeStatus = AssetVolumeStatus.creating;
            asset.updatedAt = new Date();
            await asset.save();

            await volumeCreator
                .createVolumeFromTarGzipAsset(
                    uploadPaths.absolute.host,
                    volumeName,
                    environment.guestPaths.build,
                )
                .then(
                    async () => {
                        asset.volumeName = volumeName;
                        asset.volumeStatus = AssetVolumeStatus.created;
                        asset.updatedAt = new Date();
                        await asset.save();
                    },
                    async (error) => {
                        console.error('Failed to create asset volume.');
                        asset.volumeStatus = AssetVolumeStatus.failed;
                        asset.updatedAt = new Date();
                        await asset.save();
                        throw error;
                    },
                );

            console.log('Succeeded to create asset volume.');
            console.log('');
        }

        console.log('Done, assets refreshed.');
    };

    try {
        switch (commandName) {
            case CommandNames.assetRefresh:
                await handleAssetRefresh();
                break;

            default:
                throw new Error('Unknown console command.');
        }
    } catch (error) {
        console.log(error);
        app.close();
        process.exit(1);
    }

    app.close();
    process.exit();
}

bootstrap();
