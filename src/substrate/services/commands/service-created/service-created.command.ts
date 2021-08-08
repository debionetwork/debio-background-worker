import { Service } from '../../models/service';

export class ServiceCreatedCommand {
  constructor(
    public readonly services: Service,
  ) {}
}