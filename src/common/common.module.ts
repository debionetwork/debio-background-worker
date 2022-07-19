import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [GCloudSecretManagerModule.withConfig(process.env.PARENT)],
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => ({
        node: gCloudSecretManagerService
          .getSecret('ELASTICSEARCH_NODE')
          .toString(),
        auth: {
          username: gCloudSecretManagerService
            .getSecret('ELASTICSEARCH_USERNAME')
            .toString(),
          password: gCloudSecretManagerService
            .getSecret('ELASTICSEARCH_PASSWORD')
            .toString(),
        },
      }),
    }),
    CqrsModule,
  ],
  exports: [ElasticsearchModule, CqrsModule],
})
export class CommonModule {}
