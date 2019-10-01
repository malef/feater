// tslint:disable:no-console

import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from '../app.module';
import { CommandLogRepository } from '../persistence/repository/command-log.repository';
import { DefinitionRepository } from '../persistence/repository/definition.repository';
import { INestApplicationContext } from '@nestjs/common';
import { InstanceRepository } from '../persistence/repository/instance.repository';
import { ActionLogRepository } from '../persistence/repository/action-log.repository';
import * as _ from 'lodash';

async function bootstrap() {
    console.log('\n\nStarting migration 0001.\n\n');
    const app: INestApplicationContext = await NestFactory.createApplicationContext(
        ApplicationModule,
    );

    const definitionRepository = app.get(DefinitionRepository);
    const instanceRepository = app.get(InstanceRepository);
    const actionLogRepository = app.get(ActionLogRepository);
    const commandLogRepository = app.get(CommandLogRepository);

    const definitions = await definitionRepository.find({}, 0, 999999);
    console.log(`${definitions.length} definition(s) to migrate.`);
    for (const definition of definitions) {
        if (definition.config.actions) {
            console.log(
                `-- skipping definition ${definition._id.toString()} named '${
                    definition.name
                }'.`,
            );

            continue;
        }

        console.log(
            `-- migrating definition ${definition._id.toString()} named '${
                definition.name
            }'.`,
        );
        definition.config.actions = [
            {
                id: 'create_instance',
                name: 'Create instance',
                type: 'instantiation',
                afterBuildTasks: _.cloneDeep(definition.config.afterBuildTasks),
            },
        ];
        delete definition.config.afterBuildTasks;

        definition.markModified('config');
        await definition.save();
    }
    console.log('All definitions migrated.\n\n');

    const instances = await instanceRepository.find({}, 0, 999999);
    console.log(`${instances.length} instance(s) to migrate.`);
    for (const instance of instances) {
        const existingActionLogs = await actionLogRepository.find(
            { instanceId: instance._id.toString() },
            0,
            1,
        );
        if (existingActionLogs.length) {
            console.log(
                `-- skipping instance ${instance._id.toString()} named '${
                    instance.name
                }'.`,
            );

            continue;
        }

        console.log(
            `-- migrating instance ${instance._id.toString()} named '${
                instance.name
            }'.`,
        );

        const actionLog = await actionLogRepository.create(
            instance.id,
            'create_instance',
            'instantiation',
            'Create instance',
        );
        actionLog.createdAt = instance.createdAt;
        actionLog.markModified('createdAt');
        if (instance.completedAt) {
            actionLog.completedAt = instance.completedAt;
            actionLog.markModified('completedAt');
        }
        if (instance.failedAt) {
            actionLog.failedAt = instance.failedAt;
            actionLog.markModified('failedAt');
        }
        await actionLog.save();

        const commandLogs = await commandLogRepository.find(
            { instanceId: instance._id.toString() },
            0,
            999999,
        );
        for (const commandLog of commandLogs) {
            commandLog.set('actionLogId', actionLog._id.toString());
            commandLog.markModified('actionLogId');
            commandLog.set('taskId', undefined);
            commandLog.markModified('taskId');
            await commandLog.save();
        }
    }
    console.log('All instances migrated.\n\n');

    // Remove obsolete `details` from all commandLogs.
    const commandLogs = await commandLogRepository.find({}, 0, 999999);
    console.log(`${commandLogs.length} command log(s) to migrate.`);
    for (const commandLog of commandLogs) {
        commandLog.set('details', undefined);
        commandLog.markModified('details');
        await commandLog.save();
    }
    console.log('All command logs migrated.\n\n');

    await app.close();
    process.exit();
}

bootstrap();
