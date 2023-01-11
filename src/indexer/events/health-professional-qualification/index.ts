export * from './commands/health-professional-qualification-created/health-professional-qualification-created.command';
export * from './commands/health-professional-qualification-deleted/health-professional-qualification-deleted.command';
export * from './commands/health-professional-qualification-updated/health-professional-qualification-updated.command';

import { HealthProfessionalQualificationCreatedHandler } from './commands/health-professional-qualification-created/health-professional-qualification-created.handler';
import { HealthProfessionalQualificationDeletedHandler } from './commands/health-professional-qualification-deleted/health-professional-qualification-deleted.handler';
import { HealthProfessionalQualificationUpdatedHandler } from './commands/health-professional-qualification-updated/health-professional-qualification-updated.handler';

export const HealthProfessionalQualificationsHandlers = [
  HealthProfessionalQualificationCreatedHandler,
  HealthProfessionalQualificationDeletedHandler,
  HealthProfessionalQualificationUpdatedHandler,
];
