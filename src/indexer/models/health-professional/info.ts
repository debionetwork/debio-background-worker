export class HealthProfessionalInfo {
  constructor(data: any) {
    this.box_public_key = data.boxPublicKey;
    this.first_name = data.firstName;
    this.last_name = data.lastName;
    this.myriad_username = data.myriadUsername;
    this.gender = data.gender;
    this.date_of_birth = data.dateOfBirth;
    this.email = data.email;
    this.phone_number = data.phoneNumber;
    this.role = data.role;
    this.category = data.category;
    this.profile_link = data.profileLink;
    this.profile_image = data.profileImage;
    this.anonymous = data.anonymous;
  }
  box_public_key: string;
  first_name: string;
  last_name: string;
  myriad_username: string;
  gender: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  role: string;
  category: string;
  profile_link: string;
  profile_image: string;
  anonymous: boolean;
}
