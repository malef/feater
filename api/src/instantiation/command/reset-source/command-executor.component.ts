import {Injectable} from '@nestjs/common';
import {SimpleCommandExecutorComponentInterface} from '../../executor/simple-command-executor-component.interface';
import {DeployKeyRepository} from '../../../persistence/repository/deploy-key.repository';
import {ResetSourceCommand} from './command';
import {DeployKeyInterface} from '../../../persistence/interface/deploy-key.interface';
import {SimpleCommand} from '../../executor/simple-command';
import {Checkout, Commit, FetchOptions, Repository, Reset} from 'nodegit';
import {CommandLogger} from '../../logger/command-logger';
import * as nodegit from 'nodegit';
import * as gitUrlParse from 'git-url-parse';
import * as sshFingerprint from 'ssh-fingerprint';

@Injectable()
export class ResetSourceCommandExecutorComponent implements SimpleCommandExecutorComponentInterface {

    constructor(
        private readonly deployKeyRepository: DeployKeyRepository,
    ) {}

    supports(command: SimpleCommand): boolean {
        return (command instanceof ResetSourceCommand);
    }

    async execute(command: SimpleCommand): Promise<any> {
        const typedCommand = (command as ResetSourceCommand);
        const logger = typedCommand.commandLogger;

        if ('commit' === typedCommand.referenceType) {
            logger.info(`Skipping reset as reference type is commit.`);

            return {};
        }

        logger.info(`Finding deploy key.`);
        const deployKey = await this.findDeployKey(typedCommand, logger);

        logger.info(`Opening repository.`);
        const repository = await Repository.open(typedCommand.absoluteGuestInstanceDirPath);

        logger.info(`Fetching remote.`);
        await repository.fetch('origin', this.createFetchOptions(deployKey));

        logger.info(`Getting reference commit from remote branch.`);
        const commit = await this.getReferenceCommit(typedCommand, repository);

        logger.info(`Resetting repository.`);
        await Reset.reset(
            repository,
            // @ts-ignore: Argument of type 'Commit' is not assignable to parameter of type 'Object'.
            commit,
            Reset.TYPE.HARD,
            {checkoutStrategy: Checkout.STRATEGY.FORCE}, // TODO Is this checkout option needed?
        );
        logger.info(`Reset completed.`);

        return {};
    }

    private async findDeployKey(command: ResetSourceCommand, logger: CommandLogger): Promise<DeployKeyInterface | null> {
        logger.info(`Clone URL: ${command.cloneUrl}`);

        if ('ssh' !== gitUrlParse(command.cloneUrl).protocol) {
            logger.info(`Not using deploy key.`);

            return null;
        }

        logger.info(`Using deploy key to clone over SSH.`);
        const deployKey = await this.deployKeyRepository.findOneByCloneUrl(command.cloneUrl);
        logger.info(`Deploy key fingerprint: ${sshFingerprint(deployKey.publicKey)}`);

        return deployKey;
    }

    private createFetchOptions(deployKey?: DeployKeyInterface): FetchOptions {
        const fetchOptions: FetchOptions = {
            callbacks: {},
        };

        if (deployKey) {
            fetchOptions.callbacks.credentials = (repoUrl, username) => nodegit.Cred.sshKeyMemoryNew(
                username,
                deployKey.publicKey,
                deployKey.privateKey,
                deployKey.passphrase,
            );
        }

        return fetchOptions;
    }

    private async getReferenceCommit(command: ResetSourceCommand, repo: nodegit.Repository): Promise<Commit> {
        if ('branch' !== command.referenceType) {
            throw new Error('Unsupported reference type, only branches are supported.');
        }

        const commit = await repo.getReferenceCommit(`refs/remotes/origin/${command.referenceName}`);
        command.commandLogger.info(`Referenced branch: ${command.referenceName}`);
        command.commandLogger.info(`Commit hash: ${commit.sha()}`);

        return commit;
    }
}
