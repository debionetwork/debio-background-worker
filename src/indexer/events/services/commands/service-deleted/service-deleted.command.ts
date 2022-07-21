import { BlockMetaData } from '../../../../models/block-meta-data';
import { Service } from '../../../../models/service/service';

export class ServiceDeletedCommandIndexer {
  services: Service;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const serviceData = data[0];
    this.services = new Service(serviceData.toHuman());
  }
}
