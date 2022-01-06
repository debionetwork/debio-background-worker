import { ServiceFlow } from '../../models/service-flow';
import { ServiceInfo } from './service-info';

export class Service {
  constructor(
    service: any
  ) {
    this.id       = service.id;
    this.ownerId  = service.ownerId;

    this.info = new ServiceInfo(service.info);
    this.serviceFlow = service.serviceFlow;
  }
  id: string;
  ownerId: string;
  info: ServiceInfo;
  serviceFlow: ServiceFlow;
}
