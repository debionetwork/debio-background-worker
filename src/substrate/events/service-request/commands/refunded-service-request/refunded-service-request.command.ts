import { BlockMetaData } from '../../../../models/blockMetaData';

export class RefundedServiceRequestCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    
  }
}