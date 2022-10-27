export class MenstrualCalendar {
  constructor(menstrualCalendar: any) {
    this.id = menstrualCalendar.id;
    this.addressId = menstrualCalendar.addressId;
    this.averageCycle = menstrualCalendar.averageCycle;
    this.cycleLog = menstrualCalendar.cycleLog;
    this.createdAt = new Date(
      String(menstrualCalendar.createdAt).split(',').join(''),
    );
    this.updatedAt = menstrualCalendar?.updatedAt
      ? new Date(String(menstrualCalendar.updatedAt).split(',').join(''))
      : null;
  }

  id: string;
  addressId: string;
  averageCycle: number;
  cycleLog: Array<string>;
  createdAt: Date;
  updatedAt: Date | null;
}
