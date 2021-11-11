import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Service } from '../../models/service';

export class ServiceDeletedCommand {
  services: Service;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.services = new Service(
      data[0]["id"],
      data[0]["ownerId"],
      data[0]["info"],
      data[0]["serviceFlow"]
    );
  }
}
