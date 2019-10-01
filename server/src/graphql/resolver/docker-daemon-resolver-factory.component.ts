import { Injectable } from '@nestjs/common';
import { ContainerStateChecker } from '../../instantiation/container-state-checker.service';
import { IpAddressChecker } from '../../instantiation/ip-address-checker.service';

@Injectable()
export class DockerDaemonResolverFactory {
    constructor(
        private readonly containerStatusChecker: ContainerStateChecker,
        private readonly ipAddressChecker: IpAddressChecker,
    ) {}

    public getContainerStateResolver(
        containerNamePrefixExtractor?: (object: any) => string,
    ): (object: any) => Promise<string | null> {
        return async (object: any): Promise<string | null> => {
            return this.containerStatusChecker.check(
                containerNamePrefixExtractor(object),
            );
        };
    }

    public getIpAddressResolver(
        containerNamePrefixExtractor?: (object: any) => string,
    ): (object: any) => Promise<string | null> {
        return async (object: any): Promise<string | null> => {
            return this.ipAddressChecker.check(
                containerNamePrefixExtractor(object),
            );
        };
    }
}
