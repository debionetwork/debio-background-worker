import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  LocationEntities,
  ProcessEnvModule,
  ProcessEnvProxy,
} from '@common/index';
import { EscrowAccounts } from '@common/escrow/models/deposit.entity';
import { IndexerModule } from '@indexer/indexer.module';
import { SubstrateListenerModule } from '@listeners/substrate-listener/substrate-listener.module';
import { SchedulersModule } from '@schedulers/schedulers.module';
import { config } from 'src/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_POSTGRES: 'debio_escrow_dev',
        }),
      ],
      inject: [ProcessEnvProxy],
      useFactory: async (processEnvProxy: ProcessEnvProxy) => {
        return {
          type: 'postgres',
          host: processEnvProxy.env.HOST_POSTGRES,
          port: 5432,
          username: config.POSTGRES_USERNAME.toString(),
          password: config.POSTGRES_PASSWORD.toString(),
          database: processEnvProxy.env.DB_POSTGRES,
          entities: [EscrowAccounts],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'dbLocation',
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_LOCATION: 'debio_locations',
        }),
      ],
      inject: [ProcessEnvProxy],
      useFactory: async (processEnvProxy: ProcessEnvProxy) => {
        return {
          type: 'postgres',
          host: processEnvProxy.env.HOST_POSTGRES,
          port: 5432,
          username: config.POSTGRES_USERNAME.toString(),
          password: config.POSTGRES_PASSWORD.toString(),
          database: processEnvProxy.env.DB_LOCATION,
          entities: [...LocationEntities],
          autoLoadEntities: true,
        };
      },
    }),
    IndexerModule,
    SchedulersModule,
    SubstrateListenerModule,
    MailerModule,
  ],
})
export class AppModule {}
