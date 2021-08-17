import { Service } from '../../models/service';

export class ServiceDeletedCommand {
  constructor(public readonly services: Service) {}
}
