import { DurationType } from './durationType';

export class ExpectedDuration {
  constructor(expectedDuration: any) {
    this.duration = expectedDuration.duration;
    this.duration_type = expectedDuration.durationType;
  }

  public duration: number;
  public duration_type: DurationType;
}
