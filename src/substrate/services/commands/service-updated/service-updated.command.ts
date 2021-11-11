import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Service } from '../../models/service';

export class ServiceUpdatedCommand {
  services: Service;
  constructor(data: Array<Service>, public readonly blockMetaData: BlockMetaData) {
    this.services = data[0];
  }
}
