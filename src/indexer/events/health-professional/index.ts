export * from './commands/health-professional-availability-status-updated/health-professional-availability-status-updated.command';
export * from './commands/health-professional-info-updated/health-professional-info-updated.command';
export * from './commands/health-professional-registered/health-professional-registered.command';
export * from './commands/health-professional-staked/health-professional-staked.command';
export * from './commands/health-professional-unregistered/health-professional-unregistered.command';
export * from './commands/health-professional-unstaked/health-professional-unstaked.command';
export * from './commands/health-professional-unstaked-amount/health-professional-unstaked-amount.command';
export * from './commands/health-professional-verification-status-updated/health-professional-verification-status-updated.command';

import { HealthProfessionalAvailabilityStatusHandler } from './commands/health-professional-availability-status-updated/health-professional-availability-status-updated.handler';
import { HealthProfessionalInfoUpdatedHandler } from './commands/health-professional-info-updated/health-professional-info-updated.handler';
import { HealthProfessionalRegisteredHandler } from './commands/health-professional-registered/health-professional-registered.handler';
import { HealthProfessionalStakedHandler } from './commands/health-professional-staked/health-professional-staked.handler';
import { HealthProfessionalUnregisteredHandler } from './commands/health-professional-unregistered/health-professional-unregistered.handler';
import { HealthProfessionalUnstakedHandler } from './commands/health-professional-unstaked/health-professional-unstaked.handler';
import { HealthProfessionalUnstakedAmountHandler } from './commands/health-professional-unstaked-amount/health-professional-unstaked-amount.handler';
import { HealthProfessionalVerificationStatusHandler } from './commands/health-professional-verification-status-updated/health-professional-verification-status-updated.handler';

export const HealthProfessionalHandlers = [
  HealthProfessionalAvailabilityStatusHandler,
  HealthProfessionalInfoUpdatedHandler,
  HealthProfessionalRegisteredHandler,
  HealthProfessionalStakedHandler,
  HealthProfessionalUnregisteredHandler,
  HealthProfessionalUnstakedHandler,
  HealthProfessionalUnstakedAmountHandler,
  HealthProfessionalVerificationStatusHandler,
];
