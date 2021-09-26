import { Service } from '../../../services/models/service';

export class CreateServiceBlockCommand {
  constructor(public readonly blockNumber: number, public readonly services: Service) {}
}
