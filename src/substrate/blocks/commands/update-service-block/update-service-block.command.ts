import { Service } from '../../../services/models/service';

export class UpdateServiceBlockCommand {
  constructor(public readonly blockNumber: number, public readonly services: Service) {}
}
