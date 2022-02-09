import { Module } from '@nestjs/common';
import { LabCommandHandlers } from './events/labs';
import { ServiceCommandHandlers } from './events/services';
import { CommonModule } from '../common/common.module';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { SubstrateController, SubstrateService } from './substrate.handler';
import { OrderCommandHandlers } from './events/orders';
import { GeneticTestingCommandHandlers } from './events/genetic-testing';
import { RequestServiceCommandHandlers } from './events/service-request';
import { CertificationsCommandHandlers } from './events/certifications';
import { ProcessEnvModule } from '../common/process-env/process-env.module';
import { GeneticAnalystQualificationsCommandHandlers } from './events/genetic-analyst-qualifications';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [CommonModule, ProcessEnvModule],
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
    ...CertificationsCommandHandlers,
    ...GeneticAnalystQualificationsCommandHandlers
  ],
})
export class SubstrateModule {}
