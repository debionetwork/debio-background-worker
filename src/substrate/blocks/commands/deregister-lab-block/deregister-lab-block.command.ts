import { Lab } from "../../../labs/models/lab";

export class DeregisterLabBlockCommand {
  constructor(public readonly blockNumber: number, public readonly labs: Lab) {}
}