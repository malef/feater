import {Injectable} from '@nestjs/common';
import {ContainerInfoChecker} from './container-info-checker.service';

@Injectable()
export class ContainerStateChecker {

    constructor(
        private readonly containerInfoChecker: ContainerInfoChecker,
    ) {}

    async check(containerNamePrefix: string): Promise<string|null> {
        const containerInfo = this.containerInfoChecker.getContainerInfo(containerNamePrefix);

        return containerInfo ? containerInfo.state : null;
    }
}
