import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Service } from '../../models/service';

export class ServiceDeletedCommand {
  services: Service;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.services = data[0];
  }
}
