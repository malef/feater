// tslint:disable:no-console

import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from '../app.module';
import {DefinitionRepository} from '../persistence/repository/definition.repository';
import {INestApplicationContext} from '@nestjs/common';
import {DeployKeyRepository} from '../persistence/repository/deploy-key.repository';

async function bootstrap() {
    console.log('\n\nStarting migration 0002.\n\n');
    const app: INestApplicationContext = await NestFactory.createApplicationContext(ApplicationModule);

    const definitionRepository = app.get(DefinitionRepository);
    const deployKeyRepository = app.get(DeployKeyRepository);

    const definitions = await definitionRepository.find({}, 0, 999999);
    console.log(`${definitions.length} definition(s) to migrate.`);
    for (const definition of definitions) {
        console.log(`-- migrating definition ${definition._id.toString()} named '${definition.name}'.`);
        for (const source of definition.config.sources) {
            source.id = source.id.trim();
            source.cloneUrl = source.cloneUrl.trim();
            source.reference.name = source.reference.name.trim();
        }
        definition.markModified('config');
        await definition.save();
    }
    console.log('All definitions migrated.\n\n');

    const deployKeys = await deployKeyRepository.find({}, 0, 999999);
    console.log(`${deployKeys.length} deploy key(s) to migrate.`);
    for (const deployKey of deployKeys) {
        if (deployKey.cloneUrl.trim() === deployKey.cloneUrl) {
            console.log(`-- skipping deploy key ${deployKey._id.toString()} for clone URL '${deployKey.cloneUrl}'.`);

            continue;
        }

        console.log(`-- removing deploy key ${deployKey._id.toString()} for clone URL '${deployKey.cloneUrl}'.`);
        await deployKey.remove();
    }
    console.log('All deploy keys migrated.\n\n');

    await app.close();
    process.exit();
}

bootstrap();
