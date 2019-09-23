// tslint:disable:no-console

import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from '../app.module';
import {CommandLogRepository} from '../persistence/repository/command-log.repository';
import {DefinitionRepository} from '../persistence/repository/definition.repository';
import {INestApplicationContext} from '@nestjs/common';
import {InstanceRepository} from '../persistence/repository/instance.repository';
import {ActionLogRepository} from '../persistence/repository/action-log.repository';
import * as _ from 'lodash';

async function bootstrap() {
    console.log('\n\nStarting migration 0003.\n\n');
    const app: INestApplicationContext = await NestFactory.createApplicationContext(ApplicationModule);

    const definitionRepository = app.get(DefinitionRepository);
    const instanceRepository = app.get(InstanceRepository);

    const definitions = await definitionRepository.find({}, 0, 999999);
    console.log(`${definitions.length} definition(s) to migrate.`);
    for (const definition of definitions) {
        if (definition.config.downloadables) {
            console.log(`-- skipping definition ${definition._id.toString()} named '${definition.name}'.`);

            continue;
        }

        console.log(`-- migrating definition ${definition._id.toString()} named '${definition.name}'.`);
        definition.config.downloadables = [];
        definition.markModified('config');
        await definition.save();
    }
    console.log('All definitions migrated.\n\n');

    const instances = await instanceRepository.find({}, 0, 999999);
    console.log(`${instances.length} instance(s) to migrate.`);
    for (const instance of instances) {
        if (instance.downloadables) {
            console.log(`-- skipping definition ${instance._id.toString()} named '${instance.name}'.`);

            continue;
        }

        console.log(`-- migrating definition ${instance._id.toString()} named '${instance.name}'.`);
        instance.downloadables = [];
        instance.markModified('downloadables');
        await instance.save();
    }
    console.log('All instances migrated.\n\n');

    await app.close();
    process.exit();
}

bootstrap();
