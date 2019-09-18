// tslint:disable:no-console

import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from '../app.module';
import {DefinitionRepository} from '../persistence/repository/definition.repository';
import {INestApplicationContext} from '@nestjs/common';
import * as _ from 'lodash';

async function bootstrap() {
    console.log('Starting.');
    const app: INestApplicationContext = await NestFactory.createApplicationContext(ApplicationModule);

    const definitionRepository = app.get(DefinitionRepository);
    const definitions = await definitionRepository.find({}, 0, 9999);

    console.log(`${definitions.length} definition(s) to migrate.`);
    for (const definition of definitions) {
        if (definition.config.actions) {
            console.log(`Skipping definition ${definition._id.toString()} named '${definition.name}'.`);

            continue;
        }

        console.log(`Migrating definition ${definition._id.toString()} named '${definition.name}'.`);
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
    console.log('All definitions migrated.');

    await app.close();
    process.exit();
}

bootstrap();
