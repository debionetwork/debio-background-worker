import { Module } from '@nestjs/common';
import { EscrowModule } from '@common/escrow/escrow.module';
import {
  DateTimeModule,
  DebioConversionModule,
  MailModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '@common/index';
import { GeneticTestingCommandHandlers } from './commands/genetic-testing';
import { ServiceRequestCommandHandlers } from './commands/service-request';
import { GeneticAnalystCommandHandlers } from './commands/genetic-analysts';
import { GeneticAnalysisOrderCommandHandlers } from './commands/genetic-analysis-order';
import { GeneticAnalysisCommandHandlers } from './commands/genetic-analysis';
import { ServiceCommandHandlers } from './commands/services';
import { SubstrateListenerHandler } from './substrate-listener.handler';
import { OrderCommandHandlers } from './commands/orders';
import { CqrsModule } from '@nestjs/cqrs';
import { LocationModule } from '@common/location/location.module';
import { LabCommandHandlers } from './commands/labs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { GeneticAnalystServiceCommandHandler } from './commands/genetic-analyst-services';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MenstrualSubscriptionCommandHandler } from './commands/menstrual-subscription';
import { config } from '../../config';

@Module({
  imports: [
    ProcessEnvModule,
    EscrowModule,
    LocationModule,
    TransactionLoggingModule,
    SubstrateModule,
    DebioConversionModule,
    MailModule,
    CqrsModule,
    DateTimeModule,
    NotificationModule,
    ElasticsearchModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: async () => {
        return {
          node: config.ELASTICSEARCH_NODE.toString(),
          auth: {
            username: config.ELASTICSEARCH_USERNAME.toString(),
            password: config.ELASTICSEARCH_PASSWORD.toString(),
          },
        };
      },
    }),
    MailerModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: async () => {
        return {
          transport: {
            host: 'smtp.gmail.com',
            secure: false,
            auth: {
              user: config.EMAIL.toString(),
              pass: config.PASS_EMAIL.toString(),
            },
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter({
              colNum: (value) => parseInt(value) + 1,
            }), // or new PugAdapter() or new EjsAdapter()
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [
    SubstrateListenerHandler,
    ...ServiceCommandHandlers,
    ...GeneticTestingCommandHandlers,
    ...ServiceRequestCommandHandlers,
    ...OrderCommandHandlers,
    ...GeneticAnalysisOrderCommandHandlers,
    ...GeneticAnalysisCommandHandlers,
    ...GeneticAnalystCommandHandlers,
    ...LabCommandHandlers,
    ...BlockCommandHandlers,
    ...BlockQueryHandlers,
    ...GeneticAnalystServiceCommandHandler,
    ...MenstrualSubscriptionCommandHandler,
  ],
})
export class SubstrateListenerModule {}
