import {
  LabRegisteredCommandIndexer,
  LabUpdatedCommandIndexer,
  LabDeregisteredCommandIndexer,
  LabUpdateVerificationStatusCommandIndexer,
  LabStakeSuccessfulCommandIndexer,
  LabUnstakeSuccessfulCommandIndexer,
  LabRetrieveUnstakeAmountCommandIndexer,
} from './events/labs';
import {
  ServiceCreatedCommandIndexer,
  ServiceUpdatedCommandIndexer,
  ServiceDeletedCommandIndexer,
} from './events/services';
import {
  OrderCancelledCommandIndexer,
  OrderCreatedCommandIndexer,
  OrderFailedCommandIndexer,
  OrderFulfilledCommandIndexer,
  OrderPaidCommandIndexer,
  OrderRefundedCommandIndexer,
} from './events/orders';
import {
  CreateServiceRequestCommandIndexer,
  UpdateServiceRequestCommandIndexer,
} from './events/service-request';
import {
  CertificationCreatedCommandIndexer,
  CertificationUpdatedCommandIndexer,
  CertificationDeletedCommandIndexer,
} from './events/certifications';
import { DataStakedCommandIndexer } from './events/genetic-testing';
import {
  AddGeneticDataCommandIndexer,
  RemoveGeneticDataCommandIndexer,
  UpdateGeneticDataCommandIndexer,
} from './events/genetic-data';
import {
  GeneticAnalystsQualificationCreatedCommandIndexer,
  GeneticAnalystsQualificationDeletedCommandIndexer,
  GeneticAnalystsQualificationUpdatedCommandIndexer,
} from './events/genetic-analyst-qualifications';
import {
  GeneticAnalystServicesCreatedCommandIndexer,
  GeneticAnalystServicesDeletedCommandIndexer,
  GeneticAnalystServicesUpdatedCommandIndexer,
} from './events/genetic-analyst-services';
import {
  GeneticAnalystsDeletedCommandIndexer,
  GeneticAnalystsRegisteredCommandIndexer,
  GeneticAnalystsRetrieveUnstakeAmountCommandIndexer,
  GeneticAnalystsStakeSuccessfulCommandIndexer,
  GeneticAnalystsUpdateAvailabilityStatusCommandIndexer,
  GeneticAnalystsUpdatedCommandIndexer,
  GeneticAnalystsUpdateVerificationStatusCommandIndexer,
  GeneticAnalystUnstakeSuccessfulCommandIndexer,
  GeneticAnalystVerificationFailedCommandIndexer,
} from './events/genetic-analysts';
import {
  GeneticAnalysisOrderCancelledCommandIndexer,
  GeneticAnalysisOrderCreatedCommandIndexer,
  GeneticAnalysisOrderFailedCommandIndexer,
  GeneticAnalysisOrderFulfilledCommandIndexer,
  GeneticAnalysisOrderPaidCommandIndexer,
  GeneticAnalysisOrderRefundedCommandIndexer,
} from './events/genetic-analysis-order';
import {
  GeneticAnalysisInProgressCommandIndexer,
  GeneticAnalysisRejectedCommandIndexer,
  GeneticAnalysisResultReadyCommandIndexer,
  GeneticAnalysisSubmittedCommandIndexer,
} from './events/genetic-analysis';
import {
  MenstrualCalendarAddedCommandIndexer,
  MenstrualCalendarRemovedCommandIndexer,
  MenstrualCalendarUpdatedCommandIndexer,
  MenstrualCycleLogsAddedCommandIndexer,
  MenstrualCycleLogRemovedCommandIndexer,
  MenstrualCycleLogUpdatedCommandIndexer,
} from './events/menstrual-calendar';
import {
  MenstrualSubscriptionAddedCommandIndexer,
  MenstrualSubscriptionPaidCommandIndexer,
  MenstrualSubscriptionPriceAddedCommandIndexer,
  MenstrualSubscriptionUpdatedCommandIndexer,
} from './events/menstrual-subscription';
import {
  HealthProfessionalAvailabilityStatusCommandIndexer,
  HealthProfessionalInfoUpdatedCommandIndexer,
  HealthProfessionalRegisteredCommandIndexer,
  HealthProfessionalStakedCommandIndexer,
  HealthProfessionalUnregisteredCommandIndexer,
  HealthProfessionalWaitingForUnstakedCommandIndexer,
  HealthProfessionalUnstakedCommandIndexer,
  HealthProfessionalVerificationStatusCommandIndexer,
} from './events/health-professional';
import {
  OpinionAddedCommandIndexer,
  OpinionRemovedCommandIndexer,
  OpinionStatusUpdatedCommandIndexer,
  OpinionUpdatedCommandIndexer,
} from './events/opinion';
import {
  OpinionRequestedCommandIndexer,
  OpinionRequestorInfoUpdatedCommandIndexer,
} from './events/opinion-requestor';
import {
  HealthProfessionalQualificationCreatedCommandIndexer,
  HealthProfessionalQualificationDeletedCommandIndexer,
  HealthProfessionalQualificationUpdatedCommandIndexer,
} from './events/health-professional-qualification';

export const eventRoutes = {
  certifications: {
    CertificationCreated: CertificationCreatedCommandIndexer,
    CertificationUpdated: CertificationUpdatedCommandIndexer,
    CertificationDeleted: CertificationDeletedCommandIndexer,
  },
  geneticAnalysis: {
    GeneticAnalysisSubmitted: GeneticAnalysisSubmittedCommandIndexer,
    GeneticAnalysisInProgress: GeneticAnalysisInProgressCommandIndexer,
    GeneticAnalysisRejected: GeneticAnalysisRejectedCommandIndexer,
    GeneticAnalysisResultReady: GeneticAnalysisResultReadyCommandIndexer,
  },
  geneticAnalysisOrders: {
    GeneticAnalysisOrderCreated: GeneticAnalysisOrderCreatedCommandIndexer,
    GeneticAnalysisOrderPaid: GeneticAnalysisOrderPaidCommandIndexer,
    GeneticAnalysisOrderFulfilled: GeneticAnalysisOrderFulfilledCommandIndexer,
    GeneticAnalysisOrderRefunded: GeneticAnalysisOrderRefundedCommandIndexer,
    GeneticAnalysisOrderCancelled: GeneticAnalysisOrderCancelledCommandIndexer,
    GeneticAnalysisOrderFailed: GeneticAnalysisOrderFailedCommandIndexer,
  },
  geneticAnalysts: {
    GeneticAnalystRegistered: GeneticAnalystsRegisteredCommandIndexer,
    GeneticAnalystUpdated: GeneticAnalystsUpdatedCommandIndexer,
    GeneticAnalystDeleted: GeneticAnalystsDeletedCommandIndexer,
    GeneticAnalystUpdateVerificationStatus:
      GeneticAnalystsUpdateVerificationStatusCommandIndexer,
    GeneticAnalystStakeSuccessful: GeneticAnalystsStakeSuccessfulCommandIndexer,
    GeneticAnalystUpdateAvailabilityStatus:
      GeneticAnalystsUpdateAvailabilityStatusCommandIndexer,
    GeneticAnalystUnstakeSuccessful:
      GeneticAnalystUnstakeSuccessfulCommandIndexer,
    GeneticAnalystRetrieveUnstakeAmount:
      GeneticAnalystsRetrieveUnstakeAmountCommandIndexer,
    GeneticAnalystVerificationFailed:
      GeneticAnalystVerificationFailedCommandIndexer,
  },
  geneticAnalystQualifications: {
    GeneticAnalystQualificationCreated:
      GeneticAnalystsQualificationCreatedCommandIndexer,
    GeneticAnalystQualificationUpdated:
      GeneticAnalystsQualificationUpdatedCommandIndexer,
    GeneticAnalystQualificationDeleted:
      GeneticAnalystsQualificationDeletedCommandIndexer,
  },
  geneticAnalystServices: {
    GeneticAnalystServiceCreated: GeneticAnalystServicesCreatedCommandIndexer,
    GeneticAnalystServiceUpdated: GeneticAnalystServicesUpdatedCommandIndexer,
    GeneticAnalystServiceDeleted: GeneticAnalystServicesDeletedCommandIndexer,
  },
  geneticData: {
    GeneticDataAdded: AddGeneticDataCommandIndexer,
    GeneticDataUpdated: UpdateGeneticDataCommandIndexer,
    GeneticDataRemoved: RemoveGeneticDataCommandIndexer,
  },
  geneticTesting: {
    DataStaked: DataStakedCommandIndexer,
  },
  labs: {
    LabRegistered: LabRegisteredCommandIndexer,
    LabUpdated: LabUpdatedCommandIndexer,
    LabDeregistered: LabDeregisteredCommandIndexer,
    LabUpdateVerificationStatus: LabUpdateVerificationStatusCommandIndexer,
    LabStakeSuccessful: LabStakeSuccessfulCommandIndexer,
    LabUnstakeSuccessful: LabUnstakeSuccessfulCommandIndexer,
    LabRetrieveUnstakeAmount: LabRetrieveUnstakeAmountCommandIndexer,
  },
  orders: {
    OrderCreated: OrderCreatedCommandIndexer,
    OrderPaid: OrderPaidCommandIndexer,
    OrderFulfilled: OrderFulfilledCommandIndexer,
    OrderRefunded: OrderRefundedCommandIndexer,
    OrderCancelled: OrderCancelledCommandIndexer,
    OrderFailed: OrderFailedCommandIndexer,
  },
  services: {
    ServiceCreated: ServiceCreatedCommandIndexer,
    ServiceUpdated: ServiceUpdatedCommandIndexer,
    ServiceDeleted: ServiceDeletedCommandIndexer,
  },
  serviceRequest: {
    ServiceRequestCreated: CreateServiceRequestCommandIndexer,
    ServiceRequestUpdated: UpdateServiceRequestCommandIndexer,
  },
  menstrualCalendar: {
    MenstrualCalendarAdded: MenstrualCalendarAddedCommandIndexer,
    MenstrualCalendarUpdated: MenstrualCalendarUpdatedCommandIndexer,
    MenstrualCalendarRemoved: MenstrualCalendarRemovedCommandIndexer,
    MenstrualCycleLogsAdded: MenstrualCycleLogsAddedCommandIndexer,
    MenstrualCycleLogUpdated: MenstrualCycleLogUpdatedCommandIndexer,
    MenstrualCycleLogRemoved: MenstrualCycleLogRemovedCommandIndexer,
  },
  menstrualSubscription: {
    MenstrualSubscriptionAdded: MenstrualSubscriptionAddedCommandIndexer,
    MenstrualSubscriptionUpdated: MenstrualSubscriptionUpdatedCommandIndexer,
    MenstrualSubscriptionPaid: MenstrualSubscriptionPaidCommandIndexer,
    MenstrualSubscriptionPriceAdded:
      MenstrualSubscriptionPriceAddedCommandIndexer,
  },
  healthProfessional: {
    HealthProfessionalRegistered: HealthProfessionalRegisteredCommandIndexer,
    HealthProfessionalUnregistered:
      HealthProfessionalUnregisteredCommandIndexer,
    HealthProfessionalInfoUpdated: HealthProfessionalInfoUpdatedCommandIndexer,
    HealthProfessionalVerificationStatusUpdated:
      HealthProfessionalVerificationStatusCommandIndexer,
    HealthProfessionalAvailabilityStatusUpdated:
      HealthProfessionalAvailabilityStatusCommandIndexer,
    HealthProfessionalStaked: HealthProfessionalStakedCommandIndexer,
    HealthProfessionalUnstaked: HealthProfessionalUnstakedCommandIndexer,
    HealthProfessionalWaitingForUnstaked:
      HealthProfessionalWaitingForUnstakedCommandIndexer,
  },
  healthProfessionalQualification: {
    HealthProfessionalQualificationCreated:
      HealthProfessionalQualificationCreatedCommandIndexer,
    HealthProfessionalQualificationUpdated:
      HealthProfessionalQualificationUpdatedCommandIndexer,
    HealthProfessionalQualificationDeleted:
      HealthProfessionalQualificationDeletedCommandIndexer,
  },
  opinion: {
    OpinionAdded: OpinionAddedCommandIndexer,
    OpinionUpdated: OpinionUpdatedCommandIndexer,
    OpinionRemoved: OpinionRemovedCommandIndexer,
    OpinionStatusUpdated: OpinionStatusUpdatedCommandIndexer,
  },
  opinionRequestor: {
    OpinionRequested: OpinionRequestedCommandIndexer,
    OpinionRequestorInfoUpdated: OpinionRequestorInfoUpdatedCommandIndexer,
  },
};
