export class MenstrualCalendar {
  constructor(menstrualCalendar: any) {
    this.id = menstrualCalendar.id;
    this.addressId = menstrualCalendar.addressId;
    this.averageCycle = menstrualCalendar.averageCycle;
    this.cycleLog = menstrualCalendar.cycleLog;
    this.createdAt = menstrualCalendar.createdAt;
    this.updatedAt = menstrualCalendar.updatedAt;
  }

  id: string;
  addressId: string;
  averageCycle: number;
  cycleLog: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}