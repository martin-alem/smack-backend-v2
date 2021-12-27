export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

export interface SmackUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  picture: string;
  story: string;
  twoFA: { lastLoggedIn: Date; devices: string[] };
  dateJoined: Date;
}
