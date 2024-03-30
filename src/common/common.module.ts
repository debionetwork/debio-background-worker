import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { config } from 'src/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: async () => ({
        node: config.ELASTICSEARCH_NODE.toString(),
        auth: {
          username: config.ELASTICSEARCH_USERNAME.toString(),
          password: config.ELASTICSEARCH_PASSWORD.toString(),
        },
      }),
    }),
    CqrsModule,
  ],
  exports: [ElasticsearchModule, CqrsModule],
})
export class CommonModule {}
