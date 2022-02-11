import { BlockMetaData } from '../../../../models/blockMetaData';

export class DNATestResultSubmittedCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {}
}
