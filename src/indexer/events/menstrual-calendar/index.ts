export * from './commands/menstrual-calendar-added/menstrual-calendar-added.command';
export * from './commands/menstrual-calendar-updated/menstrual-calendar-updated.command';
export * from './commands/menstrual-calendar-removed/menstrual-calendar-removed.command';
export * from './commands/menstrual-cycle-log-added/menstrual-cycle-log-added.command';
export * from './commands/menstrual-cycle-log-updated/menstrual-cycle-log-updated.command';
export * from './commands/menstrual-cycle-log-removed/menstrual-cycle-log-removed.command';

import { MenstrualCalendarAddedHandler } from './commands/menstrual-calendar-added/menstrual-calendar-added.handler';
import { MenstrualCalendarUpdatedHandler } from './commands/menstrual-calendar-updated/menstrual-calendar-updated.handler';
import { MenstrualCalendarRemovedHandler } from './commands/menstrual-calendar-removed/menstrual-calendar-removed.handler';
import { MenstrualCycleLogAddedHandler } from './commands/menstrual-cycle-log-added/menstrual-cycle-log-added.handler.';
import { MenstrualCycleLogUpdatedHandler } from './commands/menstrual-cycle-log-updated/menstrual-cycle-log-updated.handler';
import { MenstrualCycleLogRemovedHandler } from './commands/menstrual-cycle-log-removed/menstrual-cycle-log-removed.handler';

export const MenstrualCalendarCommandHandlers = [
  MenstrualCalendarAddedHandler,
  MenstrualCalendarUpdatedHandler,
  MenstrualCalendarRemovedHandler,
  MenstrualCycleLogAddedHandler,
  MenstrualCycleLogUpdatedHandler,
  MenstrualCycleLogRemovedHandler,
];
