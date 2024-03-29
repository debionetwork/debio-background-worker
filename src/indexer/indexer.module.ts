import { Module } from '@nestjs/common';
import { LabCommandHandlers } from './events/labs';
import { ServiceCommandHandlers } from './events/services';
import { CommonModule } from '@common/common.module';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { IndexerHandler } from './indexer.handler';
import { OrderCommandHandlers } from './events/orders';
import { GeneticTestingCommandHandlers } from './events/genetic-testing';
import { RequestServiceCommandHandlers } from './events/service-request';
import { CertificationsCommandHandlers } from './events/certifications';
import { ProcessEnvModule } from '@common/proxies/process-env/process-env.module';
import { GeneticDataCommandHandlers } from './events/genetic-data';
import { GeneticAnalystQualificationsCommandHandlers } from './events/genetic-analyst-qualifications';
import { GeneticAnalystServicesCommandHandlers } from './events/genetic-analyst-services';
import { GeneticAnalystsCommandHandlers } from './events/genetic-analysts';
import { GeneticAnalysisCommandHandlers } from './events/genetic-analysis';
import { GeneticAnalysisOrderCommandHandlers } from './events/genetic-analysis-order';
import { MenstrualCalendarCommandHandlers } from './events/menstrual-calendar';
import { MenstrualSubscriptionCommandHandlers } from './events/menstrual-subscription';
import { HealthProfessionalHandlers } from './events/health-professional';
import { OpinionCommandHandlers } from './events/opinion';
import { OpinionRequestorCommandHandlers } from './events/opinion-requestor';
import { HealthProfessionalQualificationsHandlers } from './events/health-professional-qualification';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [CommonModule, ProcessEnvModule],
  providers: [
    IndexerHandler,
    ...LabCommandHandlers,
    ...ServiceCommandHandlers,
    ...OrderCommandHandlers,
    ...BlockCommandHandlers,
    ...BlockQueryHandlers,
    ...GeneticTestingCommandHandlers,
    ...RequestServiceCommandHandlers,
    ...CertificationsCommandHandlers,
    ...GeneticDataCommandHandlers,
    ...GeneticAnalystQualificationsCommandHandlers,
    ...GeneticAnalystServicesCommandHandlers,
    ...GeneticAnalystsCommandHandlers,
    ...GeneticAnalysisCommandHandlers,
    ...GeneticAnalysisOrderCommandHandlers,
    ...MenstrualCalendarCommandHandlers,
    ...MenstrualSubscriptionCommandHandlers,
    ...HealthProfessionalHandlers,
    ...HealthProfessionalQualificationsHandlers,
    ...OpinionCommandHandlers,
    ...OpinionRequestorCommandHandlers,
  ],
})
export class IndexerModule {}
