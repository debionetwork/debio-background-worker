import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Lab } from '../../models/lab';

export class LabDeregisteredCommand {
  constructor(public readonly labs: Lab, public readonly blockMetaData: BlockMetaData) {}
}
