import { MenstrualCalendar } from '../../../../models/menstrual-calendar/menstrual-calendar';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class MenstrualCalendarAddedCommandIndexer {
  menstrualCalendar: MenstrualCalendar;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const menstrualCalendarData = data[0];
    this.menstrualCalendar = new MenstrualCalendar(menstrualCalendarData.toHuman());
  }
}
