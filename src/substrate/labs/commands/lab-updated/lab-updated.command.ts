import { Lab } from '../../models/lab';

export class LabUpdatedCommand {
  constructor(public readonly labs: Lab) {}
}
