import { MenstrualCycleLog } from '../../../../models/menstrual-calendar/menstrual-cycle-log';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class MenstrualCycleLogRemovedCommandIndexer {
  menstrualCycleLog: MenstrualCycleLog;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const menstrualCycleLogData = data[0];
    this.menstrualCycleLog = new MenstrualCycleLog(
      menstrualCycleLogData.toHuman(),
    );
  }
}
