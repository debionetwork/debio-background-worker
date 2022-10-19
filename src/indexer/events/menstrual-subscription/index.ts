export * from './commands/menstrual-subscription-added/menstrual-subscription-added.command';
export * from './commands/menstrual-subscription-paid/menstrual-subscription-paid.command';
export * from './commands/menstrual-subscription-price-added/menstrual-subscription-price-added.command';
export * from './commands/menstrual-subscription-updated/menstrual-subscription-updated.command';

import { MenstrualSubscriptionAddedHandler } from './commands/menstrual-subscription-added/menstrual-subscription-added.handler';
import { MenstrualSubscriptionPaidHandler } from './commands/menstrual-subscription-paid/menstrual-subscription-paid.handler';
import { MenstrualSubscriptionPriceAddedHandler } from './commands/menstrual-subscription-price-added/menstrual-subscription-price-added.handler';
import { MenstrualSubscriptionUpdatedHandler } from './commands/menstrual-subscription-updated/menstrual-subscription-updated.handler';

export const MenstrualSubscriptionCommandHandlers = [
  MenstrualSubscriptionAddedHandler,
  MenstrualSubscriptionPaidHandler,
  MenstrualSubscriptionPriceAddedHandler,
  MenstrualSubscriptionUpdatedHandler,
];
