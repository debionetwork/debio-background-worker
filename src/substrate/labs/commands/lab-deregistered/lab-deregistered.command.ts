import { Lab } from '../../models/lab';

export class LabDeregisteredCommand {
  constructor(
    public readonly labs: Lab,
  ) {}
}