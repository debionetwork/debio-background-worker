import { Module } from '@nestjs/common';
import { LabCommandHandlers } from './labs';
import { ServiceCommandHandlers } from './services';
import { CommonModule } from 'src/common/common.module';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { SubstrateController, SubstrateService } from './substrate.handler';

@Module({
  imports:[
    CommonModule,
  ],
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
