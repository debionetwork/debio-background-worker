import { MenstrualCycleLog } from '../../../../models/menstrual-calendar/menstrual-cycle-log';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class MenstrualCycleLogAddedCommandIndexer {
  menstrualCycleLog: MenstrualCycleLog;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const menstrualCycleLogData = data[0];
    this.accountId = data[1].toString();
    this.menstrualCycleLog = new MenstrualCycleLog(
      menstrualCycleLogData.toHuman(),
    );
  }
}
