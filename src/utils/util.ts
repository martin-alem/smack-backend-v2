import { Response } from "express";
import { config } from "./magic.js";

export function getFormattedDate(): string {
  const date = new Date();
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
}

export function setCookie(res: Response, key: string, value: string, expiration: number) {
  res.cookie(key, value, {
    expires: new Date(Date.now() + expiration * 3600000),
    httpOnly: true,
    domain: "localhost",
    sameSite: "lax",
  });
}

export function computeDateDiff(date: string): number {
  const currentTime = new Date(Date.now()).getTime();
  const pastTime = new Date(date).getTime();
  return currentTime - pastTime;
}

export function getCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * 10);
    code += random.toString(10);
  }

  return code;
}

export function sendResponse(res: Response, status: string, statusCode: number, payload: any, code: string) {
  res.status(statusCode).json({ status: status, statusCode: statusCode, payload: payload, code: code });
}
