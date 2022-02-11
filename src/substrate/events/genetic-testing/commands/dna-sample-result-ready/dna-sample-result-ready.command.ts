import { BlockMetaData } from '../../../../models/blockMetaData';

export class DNASampleResultReadyCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {}
}
