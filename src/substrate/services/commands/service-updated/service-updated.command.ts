import { Service } from '../../models/service';

export class ServiceUpdatedCommand {
  constructor(public readonly services: Service) {}
}
