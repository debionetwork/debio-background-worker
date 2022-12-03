export * from './menstrual-subscription-added/menstrual-subscription-added.command';
export * from './menstrual-subscription-paid/menstrual-subscription-paid.command';

import { MenstrualSubscriptionAddedHandler } from '././menstrual-subscription-added/menstrual-subscription-added.handler';
import { MenstrualSubscriptionPaidAddedHandler } from './menstrual-subscription-paid/menstrual-subscription-paid.handler';

export const MenstrualSubscriptionCommandHandler = [
  MenstrualSubscriptionAddedHandler,
  MenstrualSubscriptionPaidAddedHandler,
];
