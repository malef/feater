import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {ActionLogInterface} from '../interface/action-log.interface';

@Injectable()
export class ActionLogRepository {

    constructor(
        @InjectModel('ActionLog') private readonly actionLogModel: Model<ActionLogInterface>,
    ) {}

    find(criteria: object, offset: number, limit: number, sort?: object): Promise<ActionLogInterface[]> {
        const query = this.actionLogModel.find(criteria);
        query
            .skip(offset)
            .limit(limit);
        if (sort) {
            query.sort(sort);
        }

        return query.exec();
    }

    create(
        instanceId: string,
        actionId: string,
        actionType: string,
    ): Promise<ActionLogInterface> {
        const createdActionLog = new this.actionLogModel({
            instanceId,
            actionId,
            actionType,
            createdAt: new Date(),
        } as ActionLogInterface);

        return createdActionLog.save();
    }
}
