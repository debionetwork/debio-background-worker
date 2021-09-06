import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
    CqrsModule,
  ],
  exports: [ElasticsearchModule, CqrsModule],
})
export class CommonModule {}
