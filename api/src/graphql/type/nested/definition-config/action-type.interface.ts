import {AfterBuildTaskTypeInterfaces} from './after-build-task-type.interface';

export interface ActionTypeInterface {
    id: string;
    name: string;
    type: string;
    createdAt: Date;
    updatedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    afterBuildTasks: AfterBuildTaskTypeInterfaces[];
}
