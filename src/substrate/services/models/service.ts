import { ServiceFlow } from 'src/substrate/models/service-flow';
import { ServiceInfo } from './service-info';

export class Service {
  constructor(
    _id: any,
    _ownerId: any,
    _info: any,
    _serviceFlow: any
  ) {
    this.id = _id;
    this.ownerId = _ownerId;
    this.info = new ServiceInfo(
      _info["name"],
      _info["pricesByCurrency"],
      _info["expectedDuration"],
      _info["category"],
      _info["description"],
      _info["dnaCollectionProcess"],
      _info["testResultSample"],
      _info["longDescription"],
      _info["image"]
    );
    this.serviceFlow = _serviceFlow;
  }
  id: string;
  ownerId: string;
  info: ServiceInfo;
  serviceFlow: ServiceFlow;
}
