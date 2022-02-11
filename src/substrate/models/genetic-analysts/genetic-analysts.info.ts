import { StakeStatus } from '../stake-status';

export class GeneticAnalystsInfo {
  constructor(info: any) {
    this.first_name = info.firstName;
    this.last_name = info.lastName;
    this.gender = info.gender;
    this.date_of_birth = info.dateOfBirth;
    this.email = info.email;
    this.phone_number = info.phoneNumber;
    this.specialization = info.specialization;
  }

  public first_name: string;
  public last_name: string;
  public gender: string;
  public date_of_birth: string;
  public email: string;
  public phone_number: string;
  public specialization: string;
}
