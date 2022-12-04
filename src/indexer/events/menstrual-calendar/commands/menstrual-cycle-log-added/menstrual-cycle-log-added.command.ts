import { MenstrualCycleLog } from '../../../../models/menstrual-calendar/menstrual-cycle-log';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class MenstrualCycleLogsAddedCommandIndexer {
  menstrualCycleLog: Array<MenstrualCycleLog>;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const menstrualCycleLogData = data[0];
    this.accountId = data[1].toString();

    const arrayMenstrualCycleLogData = menstrualCycleLogData.toHuman();

    this.menstrualCycleLog = arrayMenstrualCycleLogData.map((cycleLog: any) => {
      return new MenstrualCycleLog(cycleLog);
    });
  }
}
