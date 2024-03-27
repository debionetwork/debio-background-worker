import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import {
  EmailNotificationModule,
  MailModule,
  ProcessEnvModule,
  SubstrateModule,
  SubstrateService,
} from '@common/index';
import { MailerService } from './mailer/mailer.service';
import { UnstakedService } from './unstaked/unstaked.service';
import { MenstrualSubscriptionService } from './menstrual-subscription/menstrual-subscription.service';
import { config } from '../config';

@Module({
  imports: [
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
    ProcessEnvModule,
    SubstrateModule,
    MailModule,
    EmailNotificationModule,
  ],
  exports: [ElasticsearchModule],
  providers: [
    UnstakedService,
    SubstrateService,
    MailerService,
    MenstrualSubscriptionService,
  ],
})
export class SchedulersModule {}
