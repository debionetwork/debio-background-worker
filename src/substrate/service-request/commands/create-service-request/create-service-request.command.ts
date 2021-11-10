import { BlockMetadata } from '../../models/blockMetadata';
import { RequestModel } from '../../models/request';

export class CreateServiceRequestCommand {
  request: RequestModel;
  blockMetadata: BlockMetadata;
  constructor(args: Array<any>, blockMetadata: BlockMetadata) {
    this.request = args[1];
    this.blockMetadata = blockMetadata;
  }
}