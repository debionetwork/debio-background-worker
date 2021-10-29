import { ServiceFlow } from 'src/substrate/models/service-flow';
import { ServiceInfo } from './service-info';

export class Service {
  id: string;
  owner_id: string;
  info: ServiceInfo;
  service_flow: ServiceFlow;
}
