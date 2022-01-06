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

export function uniqueCombination(str1: string, str2: string): string {
  const strLen1 = str1.length;
  const strLen2 = str2.length;

  if (!strLen1 || !strLen2) throw new Error("str cannot be empty string");
  if (str1 === str2) throw new Error("str1 and str2 must be distinct strings");

  let counter1 = 0;
  let counter2 = 0;

  let uniqueString = "";

  const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

  while (counter1 < strLen1 && counter2 < strLen2) {
    const codePoint1 = str1.codePointAt(counter1++) as number;
    const codePoint2 = str2.codePointAt(counter2++) as number;
    const sumCodePoint = codePoint1 + codePoint2;
    const derivedCodePoint = sumCodePoint % 26;
    uniqueString += letters[derivedCodePoint];
  }

  if (counter1 < strLen1) {
    for (let i = counter1; i < strLen1; i++) {
      uniqueString += str1[i];
    }
  }

  if (counter2 < strLen2) {
    for (let i = counter2; i < strLen2; i++) {
      uniqueString += str2[i];
    }
  }

  return uniqueString;
}
