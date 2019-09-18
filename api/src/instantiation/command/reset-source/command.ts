import {SimpleCommand} from '../../executor/simple-command';

export class ResetSourceCommand extends SimpleCommand {

    readonly NAME = 'reset_source';

    constructor(
        readonly cloneUrl: string,
        readonly referenceType: string,
        readonly referenceName: string,
        readonly absoluteGuestInstanceDirPath: string,
    ) {
        super();
    }

}
