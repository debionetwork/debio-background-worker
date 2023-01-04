export class HealthProfessionalInfo {
  constructor(data: any) {
    this.box_public_key = data.box_public_key;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.myriad_username = data.myriad_username;
    this.gender = data.gender;
    this.date_of_birth = data.date_of_birth;
    this.email = data.email;
    this.phone_number = data.phone_number;
    this.role = data.role;
    this.category = data.category;
    this.profile_link = data.profile_link;
    this.profile_image = data.profile_image;
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
