import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntities, ProcessEnvModule, ProcessEnvProxy } from './common';
import { EscrowAccounts } from './common/escrow/models/deposit.entity';
import { IndexerModule } from './indexer/indexer.module';
import { EthereumListenerModule } from './listeners/ethereum-listener/ethereum-listener.module';
import { SubstrateListenerModule } from './listeners/substrate-listener/substrate-listener.module';
import { SchedulersModule } from './schedulers/schedulers.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GCloudSecretManagerModule.withConfig(process.env.PARENT),
    TypeOrmModule.forRootAsync({
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_POSTGRES: 'debio_escrow_dev',
        }),
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
      ],
      inject: [ProcessEnvProxy, GCloudSecretManagerService],
      useFactory: async (
        processEnvProxy: ProcessEnvProxy,
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          type: 'postgres',
          host: processEnvProxy.env.HOST_POSTGRES,
          port: 5432,
          username: gCloudSecretManagerService
            .getSecret('POSTGRES_USERNAME')
            .toString(),
          password: gCloudSecretManagerService
            .getSecret('POSTGRES_PASSWORD')
            .toString(),
          database: processEnvProxy.env.DB_POSTGRES,
          entities: [EscrowAccounts],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_LOCATION: 'debio_locations',
        }),
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
      ],
      inject: [ProcessEnvProxy, GCloudSecretManagerService],
      useFactory: async (
        processEnvProxy: ProcessEnvProxy,
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          type: 'postgres',
          host: processEnvProxy.env.HOST_POSTGRES,
          port: 5432,
          username: gCloudSecretManagerService
            .getSecret('POSTGRES_USERNAME')
            .toString(),
          password: gCloudSecretManagerService
            .getSecret('POSTGRES_PASSWORD')
            .toString(),
          database: processEnvProxy.env.DB_LOCATION,
          entities: [...LocationEntities],
          autoLoadEntities: true,
        };
      },
    }),
    IndexerModule,
    SchedulersModule,
    SubstrateListenerModule,
    EthereumListenerModule,
    MailerModule,
  ],
})
export class AppModule {}
