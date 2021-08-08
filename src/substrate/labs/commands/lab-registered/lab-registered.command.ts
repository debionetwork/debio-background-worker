import { Lab } from '../../models/lab';

export class LabRegisteredCommand {
  constructor(
    public readonly labs: Lab,
  ) {}
}