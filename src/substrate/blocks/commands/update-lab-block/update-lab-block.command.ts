import { Lab } from "../../../labs/models/lab";

export class UpdateLabBlockCommand {
  constructor(public readonly blockNumber: number, public readonly labs: Lab) {}
}