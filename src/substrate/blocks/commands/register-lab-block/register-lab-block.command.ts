import { Lab } from "../../../labs/models/lab";

export class RegisterLabBlockCommand {
  constructor(public readonly blockNumber: number, public readonly labs: Lab) {}
}