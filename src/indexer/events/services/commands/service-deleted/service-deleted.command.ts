import { BlockMetaData } from '../../../../models/blockMetaData';
import { Service } from '../../../../models/service/service';

export class ServiceDeletedCommand {
  services: Service;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const serviceData = data[0];
    this.services = new Service(serviceData.toHuman());
  }
}
