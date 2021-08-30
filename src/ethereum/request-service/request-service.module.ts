import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EthersModule } from 'nestjs-ethers';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { RequestServiceCommandHandlers } from './request-service';
import { RequestServiceController, RequestServiceService } from './request-service.handler';

@Module({
  imports: [    
    EthersModule.forRoot({
      network: process.env.WEB3_RPC,
      useDefaultProvider: true,
    }),
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
    CqrsModule,
  ],
  exports: [ElasticsearchModule],
  controllers: [RequestServiceController],
  providers: [
    RequestServiceService,
    ...BlockCommandHandlers,
    ...BlockQueryHandlers,
    ...RequestServiceCommandHandlers
  ],
})
export class RequestServiceModule {}
