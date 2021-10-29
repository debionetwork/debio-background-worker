import { BlockMetaData } from '../../../models/blockMetaData';
import { Lab } from '../../models/lab';

export class LabUpdateVerificationStatusCommand {
    labs: Lab;
    constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
        this.labs = data[0];
    }
}