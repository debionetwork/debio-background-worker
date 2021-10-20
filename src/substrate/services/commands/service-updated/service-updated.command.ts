import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Service } from '../../models/service';

export class ServiceUpdatedCommand {
  constructor(public readonly services: Service, public readonly blockMetaData: BlockMetaData) {}
}
