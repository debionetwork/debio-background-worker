import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Service } from '../../models/service';

export class ServiceCreatedCommand {
  services: Service;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const serviceData = data[0];
    this.services = new Service(
      serviceData["id"],
      serviceData["ownerId"],
      serviceData["info"],
      serviceData["serviceFlow"]
    );
  }
}
