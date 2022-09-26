export class MenstrualCycleLog {
  constructor(menstrualCycleLog: any) {
    this.id = menstrualCycleLog.id;
    this.menstrualCalendarId = menstrualCycleLog.menstrualCalendarId;
    this.date = menstrualCycleLog.date;
    this.menstruation = menstrualCycleLog.menstruation;
    this.symptoms = menstrualCycleLog.symptoms;
    this.createdAt = menstrualCycleLog.createdAt;
  }

  id: string;
  menstrualCalendarId: string;
  date: Date;
  menstruation: boolean;
  symptoms: Array<Symptom>;
  createdAt: Date;
  updatedAt: Date;
}

export class Symptom {
  constructor(name: string) {
    this.name = name;
  }

  name: string;
}