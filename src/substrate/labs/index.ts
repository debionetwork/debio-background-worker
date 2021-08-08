export * from "./commands/lab-updated/lab-updated.command";
export * from "./commands/lab-registered/lab-registered.command";
export * from "./commands/lab-deregistered/lab-deregistered.command";

import { LabUpdatedHandler } from "./commands/lab-updated/lab-updated.handler";
import { LabRegisteredHandler } from "./commands/lab-registered/lab-registered.handler";
import { LabDeregisteredHandler } from "./commands/lab-deregistered/lab-deregistered.handler";

export const LabCommandHandlers = [
    LabUpdatedHandler, 
    LabRegisteredHandler, 
    LabDeregisteredHandler
];