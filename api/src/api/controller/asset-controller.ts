import * as fs from 'fs-extra';
import * as path from 'path';
import * as mkdirRecursive from 'mkdir-recursive';
import * as Busboy from 'busboy';
import * as fileType from 'file-type';
import * as readChunk from 'read-chunk';
import {Controller, Post, Request, Response, Next, Param} from '@nestjs/common';
import {AssetRepository} from '../../persistence/repository/asset.repository';
import {AssetHelper} from '../../instantiation/helper/asset-helper.component';
import {environment} from '../../environments/environment';
import {exec} from 'child_process';
import {promisify} from 'util';
import * as mongoose from 'mongoose';
import {VolumeCreator} from '../../instantiation/volume-creator.service';
import {PathHelper} from '../../instantiation/helper/path-helper.component';
import {AssetVolumeStatus} from '../../persistence/interface/asset.interface';

@Controller()
export class AssetController {

    constructor(
        private readonly assetRepository: AssetRepository,
        private readonly assetHelper: AssetHelper,
        private readonly pathHelper: PathHelper,
        private readonly volumeCreator: VolumeCreator,
    ) {}

    @Post('asset/:id')
    public async create(@Request() req, @Response() res, @Next() next, @Param('id') id) {
        let assetFilePromise;

        const asset = await this.assetRepository
            .find({id}, 0, 1)
            .then(assets => {
                if (1 !== assets.length) {
                    res.status(404).send();

                    throw new Error('Asset not found.');
                }

                return assets[0];
            });

        const busboy = new Busboy({ headers: req.headers });
        const uploadPaths = this.assetHelper.getUploadPaths(asset);

        console.log(path.dirname(uploadPaths.absolute.guest));
        console.log(uploadPaths.absolute.guest);

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            if ('asset' !== fieldname) {
                return;
            }

            assetFilePromise = new Promise((resolve, reject) => {
                mkdirRecursive.mkdirSync(path.dirname(uploadPaths.absolute.guest));

                const writeStream = fs.createWriteStream(uploadPaths.absolute.guest);
                file.pipe(writeStream);

                writeStream.on('close', () => {
                    resolve();
                });
            });
        });

        busboy.on('finish', async () => {
            if (!assetFilePromise) {
                res.status(500).send();

                return;
            }

            await assetFilePromise;

            asset.mimeType = fileType(readChunk.sync(uploadPaths.absolute.guest, 0, fileType.minimumBytes)).mime;
            asset.uploaded = true;
            asset.updatedAt = new Date();
            await asset.save();

            res.status(200).send();

            if ('application/gzip' === asset.mimeType) {
                asset.volumeStatus = AssetVolumeStatus.creating;
                asset.updatedAt = new Date();
                await asset.save();

                const volumeName = `${environment.instantiation.assetVolumeNamePrefix}_${asset._id.toHexString()}`;
                this.volumeCreator
                    .createVolumeFromTarGzipAsset(
                        uploadPaths.absolute.host,
                        volumeName,
                        environment.guestPaths.build,
                    )
                    .then(async () => {
                        asset.volumeName = volumeName;
                        asset.volumeStatus = AssetVolumeStatus.created;
                        asset.updatedAt = new Date();
                        await asset.save();
                    })
                    .catch(async (error) => {
                        asset.volumeStatus = AssetVolumeStatus.failed;
                        asset.updatedAt = new Date();
                        await asset.save();
                    });
            }
        });

        req.pipe(busboy);
    }

    protected createAssetVolume(): void {

    }
}
