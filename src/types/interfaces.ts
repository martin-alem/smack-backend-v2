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

export interface SMSSuccess {
  message: string;
}

export enum MessageType {
  TEXT = "text",
  AUDIO = "audio",
  ATTACHMENT = "attachment",
  IMAGE = "image",
  MIX = "mix",
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  SEEN = "seen",
}
