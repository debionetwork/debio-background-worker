import {
  LabRegisteredCommand,
  LabUpdatedCommand,
  LabDeregisteredCommand,
  LabUpdateVerificationStatusCommand,
  LabStakeSuccessfulCommand,
  LabUnstakeSuccessfulCommand,
  LabRetrieveUnstakeAmountCommand,
} from './events/labs';
import {
  ServiceCreatedCommand,
  ServiceUpdatedCommand,
  ServiceDeletedCommand,
} from './events/services';
import {
  OrderCancelledCommand,
  OrderCreatedCommand,
  OrderFailedCommand,
  OrderFulfilledCommand,
  OrderPaidCommand,
  OrderRefundedCommand,
} from './events/orders';
import {
  CreateServiceRequestCommand,
  ClaimedServiceRequestCommand,
  ProcessedServiceRequestCommand,
  FinalizedServiceRequestCommand,
  UnstakedServiceRequestCommand,
  UnstakedWaitingServiceRequestCommand,
} from './events/service-request';
import {
  CertificationCreatedCommand,
  CertificationUpdatedCommand,
  CertificationDeletedCommand,
} from './events/certifications';
import { DataStakedCommand } from './events/genetic-testing';
import {
  AddGeneticDataCommand,
  RemoveGeneticDataCommand,
  UpdateGeneticDataCommand,
} from './events/genetic-data';
import {
  GeneticAnalystsQualificationCreatedCommand,
  GeneticAnalystsQualificationDeletedCommand,
  GeneticAnalystsQualificationUpdatedCommand,
} from './events/genetic-analyst-qualifications';
import {
  GeneticAnalystServicesCreatedCommand,
  GeneticAnalystServicesDeletedCommand,
  GeneticAnalystServicesUpdatedCommand,
} from './events/genetic-analyst-services';
import {
  GeneticAnalystsDeletedCommand,
  GeneticAnalystsRegisteredCommand,
  GeneticAnalystsRetrieveUnstakeAmountCommand,
  GeneticAnalystsStakeSuccessfulCommand,
  GeneticAnalystsUpdateAvailabilityStatusCommand,
  GeneticAnalystsUpdatedCommand,
  GeneticAnalystsUpdateVerificationStatusCommand,
  GeneticAnalystUnstakeSuccessfulCommand,
  GeneticAnalystVerificationFailedCommand,
} from './events/genetic-analysts';
import {
  GeneticAnalysisOrderCancelledCommand,
  GeneticAnalysisOrderCreatedCommand,
  GeneticAnalysisOrderFailedCommand,
  GeneticAnalysisOrderFulfilledCommand,
  GeneticAnalysisOrderPaidCommand,
  GeneticAnalysisOrderRefundedCommand,
} from './events/genetic-analysis-order';
import {
  GeneticAnalysisInProgressCommand,
  GeneticAnalysisRejectedCommand,
  GeneticAnalysisResultReadyCommand,
  GeneticAnalysisSubmittedCommand,
} from './events/genetic-analysis';

export const eventRoutes = {
  certifications: {
    CertificationCreated: CertificationCreatedCommand,
    CertificationUpdated: CertificationUpdatedCommand,
    CertificationDeleted: CertificationDeletedCommand,
  },
  geneticAnalysis: {
    GeneticAnalysisSubmitted: GeneticAnalysisSubmittedCommand,
    GeneticAnalysisInProgress: GeneticAnalysisInProgressCommand,
    GeneticAnalysisRejected: GeneticAnalysisRejectedCommand,
    GeneticAnalysisResultReady: GeneticAnalysisResultReadyCommand,
  },
  geneticAnalysisOrders: {
    GeneticAnalysisOrderCreated: GeneticAnalysisOrderCreatedCommand,
    GeneticAnalysisOrderPaid: GeneticAnalysisOrderPaidCommand,
    GeneticAnalysisOrderFulfilled: GeneticAnalysisOrderFulfilledCommand,
    GeneticAnalysisOrderRefunded: GeneticAnalysisOrderRefundedCommand,
    GeneticAnalysisOrderCancelled: GeneticAnalysisOrderCancelledCommand,
    GeneticAnalysisOrderFailed: GeneticAnalysisOrderFailedCommand,
  },
  geneticAnalysts: {
    GeneticAnalystRegistered: GeneticAnalystsRegisteredCommand,
    GeneticAnalystUpdated: GeneticAnalystsUpdatedCommand,
    GeneticAnalystDeleted: GeneticAnalystsDeletedCommand,
    GeneticAnalystUpdateVerificationStatus:
      GeneticAnalystsUpdateVerificationStatusCommand,
    GeneticAnalystStakeSuccessful: GeneticAnalystsStakeSuccessfulCommand,
    GeneticAnalystUpdateAvailabilityStatus:
      GeneticAnalystsUpdateAvailabilityStatusCommand,
    GeneticAnalystUnstakeSuccessful: GeneticAnalystUnstakeSuccessfulCommand,
    GeneticAnalystRetrieveUnstakeAmount:
      GeneticAnalystsRetrieveUnstakeAmountCommand,
    GeneticAnalystVerificationFailed: GeneticAnalystVerificationFailedCommand,
  },
  geneticAnalystQualifications: {
    GeneticAnalystQualificationCreated:
      GeneticAnalystsQualificationCreatedCommand,
    GeneticAnalystQualificationUpdated:
      GeneticAnalystsQualificationUpdatedCommand,
    GeneticAnalystQualificationDeleted:
      GeneticAnalystsQualificationDeletedCommand,
  },
  geneticAnalystServices: {
    GeneticAnalystServiceCreated: GeneticAnalystServicesCreatedCommand,
    GeneticAnalystServiceUpdated: GeneticAnalystServicesUpdatedCommand,
    GeneticAnalystServiceDeleted: GeneticAnalystServicesDeletedCommand,
  },
  geneticData: {
    GeneticDataAdded: AddGeneticDataCommand,
    GeneticDataUpdated: UpdateGeneticDataCommand,
    GeneticDataRemoved: RemoveGeneticDataCommand,
  },
  geneticTesting: {
    DataStaked: DataStakedCommand,
  },
  labs: {
    LabRegistered: LabRegisteredCommand,
    LabUpdated: LabUpdatedCommand,
    LabDeregistered: LabDeregisteredCommand,
    LabUpdateVerificationStatus: LabUpdateVerificationStatusCommand,
    LabStakeSuccessful: LabStakeSuccessfulCommand,
    LabUnstakeSuccessful: LabUnstakeSuccessfulCommand,
    LabRetrieveUnstakeAmount: LabRetrieveUnstakeAmountCommand,
  },
  orders: {
    OrderCreated: OrderCreatedCommand,
    OrderPaid: OrderPaidCommand,
    OrderFulfilled: OrderFulfilledCommand,
    OrderRefunded: OrderRefundedCommand,
    OrderCancelled: OrderCancelledCommand,
    OrderFailed: OrderFailedCommand,
  },
  services: {
    ServiceCreated: ServiceCreatedCommand,
    ServiceUpdated: ServiceUpdatedCommand,
    ServiceDeleted: ServiceDeletedCommand,
  },
  serviceRequest: {
    ServiceRequestCreated: CreateServiceRequestCommand,
    ServiceRequestClaimed: ClaimedServiceRequestCommand,
    ServiceRequestProcessed: ProcessedServiceRequestCommand,
    ServiceRequestFinalized: FinalizedServiceRequestCommand,
    ServiceRequestUnstaked: UnstakedServiceRequestCommand,
    ServiceRequestWaitingForUnstaked: UnstakedWaitingServiceRequestCommand,
  },
};
