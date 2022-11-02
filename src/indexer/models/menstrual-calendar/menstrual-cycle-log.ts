export class MenstrualCycleLog {
  constructor(menstrualCycleLog: any) {
    this.id = menstrualCycleLog.id;
    this.menstrualCalendarId = menstrualCycleLog.menstrualCalendarId;
    this.date = new Date(Number(String(menstrualCycleLog.date).split(',').join('')));
    this.menstruation = menstrualCycleLog.menstruation;
    this.symptoms = menstrualCycleLog.symptoms;
    this.createdAt = new Date(
      Number(String(menstrualCycleLog.createdAt).split(',').join('')),
    );
    this.updatedAt = menstrualCycleLog?.updatedAt
      ? new Date(Number(String(menstrualCycleLog.updatedAt).split(',').join()))
      : null;
  }

  id: string;
  menstrualCalendarId: string;
  date: Date;
  menstruation: boolean;
  symptoms: Array<Symptom>;
  createdAt: Date;
  updatedAt: Date | null;
}

export class Symptom {
  constructor(name: string) {
    this.name = name;
  }

  name: string;
}
