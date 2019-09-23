import {Injectable} from '@nestjs/common';
import {environment} from '../environments/environment';
import {from, interval} from 'rxjs';
import {exhaustMap} from 'rxjs/operators';
import * as got from 'got';
import * as querystring from 'querystring';
import * as _ from 'lodash';

export interface CachedContainerInfo {
    readonly namePrefix: string;
    readonly id: string;
    readonly state: string;
    readonly status: string;
    readonly ipAddress: string;
}

@Injectable()
export class ContainerInfoChecker {

    private POLLING_INTERVAL = 30000; // 30 seconds.

    private containerNameRegExp = new RegExp(
        `^/${environment.instantiation.containerNamePrefix}([a-z0-9]{8})_(.+?)_\\d+\$`,
    );

    private containerInfos: CachedContainerInfo[] = [];

    constructor() {
        interval(this.POLLING_INTERVAL)
            .pipe(exhaustMap(() => from(this.fetchContainersInfo())))
            .subscribe(response => { this.updateContainersInfo(response); });
    }

    getContainerInfo(containerNamePrefix: string): CachedContainerInfo | null {
        return _.find(
            this.containerInfos,
            {namePrefix: containerNamePrefix},
        );
    }

    protected fetchContainersInfo(): Promise<void> {
        return got(
            'unix:/var/run/docker.sock:/containers/json',
            {
                json: true,
                query: this.prepareQueryString(),
            },
        );
    }

    protected prepareQueryString(): string {
        return querystring.stringify({
            all: true,
            filters: JSON.stringify({
                name: [environment.instantiation.containerNamePrefix],
            }),
        });
    }

    protected parseContainerInfo(containerInfo: any): CachedContainerInfo | null {
        const matches = containerInfo.Names[0].match(this.containerNameRegExp);
        if (null === matches) {
            return null;
        }

        const instanceHash = matches[1];
        const serviceName = matches[2];
        const networkName = `${environment.instantiation.containerNamePrefix}${instanceHash}_default`;

        return {
            namePrefix: `${environment.instantiation.containerNamePrefix}${instanceHash}_${serviceName}`,
            id: containerInfo.Id,
            state: containerInfo.State,
            status: containerInfo.Status,
            ipAddress: containerInfo.NetworkSettings.Networks[networkName].IPAddress,
        };
    }

    protected updateContainersInfo(response: any): void {
        this.containerInfos.splice(0);
        for (const containerInfo of response.body) {
            this.containerInfos.push(this.parseContainerInfo(containerInfo));
        }
    }
}
