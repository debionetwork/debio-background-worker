import { Service } from '../../../services/models/service';

export class DeleteServiceBlockCommand {
  constructor(public readonly blockNumber: number, public readonly services: Service) {}
}
