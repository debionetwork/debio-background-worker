import { ServiceFlow } from 'src/substrate/models/service-flow';
import { ServiceInfo } from './service-info';

export class Service {
  id: string;
  ownerId: string;
  info: ServiceInfo;
  serviceFlow: ServiceFlow;
}
