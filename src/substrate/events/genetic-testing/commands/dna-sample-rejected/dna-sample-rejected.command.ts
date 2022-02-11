import { BlockMetaData } from '../../../../models/blockMetaData';

export class DNASampleRejectedCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {}
}
