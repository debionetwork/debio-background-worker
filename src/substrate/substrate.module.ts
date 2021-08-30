import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LabCommandHandlers } from './labs';
import { ServiceCommandHandlers } from './services';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SubstrateController, SubstrateService } from './substrate.handler';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
    CqrsModule,
  ],
  exports: [ElasticsearchModule],
  controllers: [SubstrateController],
  providers: [
    SubstrateService,
    ...LabCommandHandlers,
    ...ServiceCommandHandlers,
    ...BlockCommandHandlers,
    ...BlockQueryHandlers
  ],
})
export class SubstrateModule {}
