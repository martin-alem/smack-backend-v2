import { Response } from "express";

export function getFormattedDate(): string {
  const date = new Date();
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
}

export function setCookie(res: Response, key: string, value: string) {
  res.cookie(key, value, {
    expires: new Date(Date.now() + 1 * 3600000),
    httpOnly: true,
    // domain: "localhost",
    sameSite: "lax",
  });
}

export function computeDateDiffInHours(date: string): number {
  const currentTime = new Date(Date.now()).getTime();
  const pastTime = new Date(date).getTime();
  return Math.floor((currentTime - pastTime) / 3.6e6);
}

export function getCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * 10);
    code += random.toString(10);
  }

  return code;
}