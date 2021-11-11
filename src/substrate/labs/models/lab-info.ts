export class LabInfo {
  constructor(
    _boxPublicKey: any,
    _name: any,
    _email: any,
    _phoneNumber: any,
    _website: any,
    _country: any,
    _region: any,
    _city: any,
    _address: any,
    _latitude: any,
    _longitude: any,
    _profileImage: any
  ) {
    const decoder = new TextDecoder();

    this.box_public_key = _boxPublicKey;
    this.name = decoder.decode(_name);
    this.email = decoder.decode(_email);
    this.phone_number = decoder.decode(_phoneNumber);
    this.website = decoder.decode(_website);
    this.country = decoder.decode(_country);
    this.region = decoder.decode(_region);
    this.city = decoder.decode(_city);
    this.address = decoder.decode(_address);
    this.latitude = _latitude;
    this.longitude = _longitude;
    this.profile_image = _profileImage;
  }

  box_public_key: String;
  name: string;
  email: string;
  phone_number: string;
  website: string;
  country: string;
  region: string;
  city: string;
  address: string;
  latitude?: string;
  longitude?: string;
  profile_image?: string;
}
