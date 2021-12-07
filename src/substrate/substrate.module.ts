import { Module } from '@nestjs/common';
import { LabCommandHandlers } from './labs';
import { ServiceCommandHandlers } from './services';
import { CommonModule } from '../common/common.module';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { SubstrateController, SubstrateService } from './substrate.handler';
import { OrderCommandHandlers } from './orders';
import { GeneticTestingCommandHandlers } from './genetic-testing';
import { RequestServiceCommandHandlers } from './service-request';
import { CertificationsCommandHandlers } from './certifications';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [CommonModule],
  controllers: [SubstrateController],
  providers: [
    SubstrateService,
    ...LabCommandHandlers,
    ...ServiceCommandHandlers,
    ...OrderCommandHandlers,
    ...BlockCommandHandlers,
    ...BlockQueryHandlers,
    ...GeneticTestingCommandHandlers,
    ...RequestServiceCommandHandlers,
    ...CertificationsCommandHandlers
  ],
})
export class SubstrateModule {}
