import { Controller, Response, Next, Param, Get } from '@nestjs/common';
import { InstanceRepository } from '../../persistence/repository/instance.repository';
import { spawn } from 'child_process';
import * as contentDisposition from 'content-disposition';
import * as moment from 'moment';
import { environment } from '../../environments/environment';

@Controller()
export class DockerLogsController {
    constructor(private readonly instanceRepository: InstanceRepository) {}

    @Get('download/docker-logs/:instanceId/:serviceId')
    public async download(
        @Response() res,
        @Next() next,
        @Param('instanceId') instanceId,
        @Param('serviceId') serviceId,
    ): Promise<void> {
        const instance = await this.instanceRepository.findById(instanceId);

        if (!instance) {
            return this.respondWithNotFound(res);
        }

        for (const service of instance.services) {
            if (service.id === serviceId) {
                const spawnedDockerLog = spawn(
                    environment.instantiation.dockerBinaryPath,
                    ['logs', service.containerId],
                );

                res.status(200).set({
                    'Content-Type': 'text/plain',
                    'Content-Disposition': contentDisposition(
                        `docker-logs-${
                            instance.hash
                        }-${serviceId}-${moment().format('YmdHis')}.log`,
                    ),
                });

                spawnedDockerLog.stdout.pipe(res);
                spawnedDockerLog.stderr.pipe(res); // TODO Handle error differently.

                return;
            }
        }
    }

    protected respondWithNotFound(res) {
        res.status(404).send();
    }
}
