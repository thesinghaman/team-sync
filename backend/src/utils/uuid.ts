import { v4 as uuidv4 } from "uuid";

export function generateInviteCode() {
  return uuidv4().replace(/-/g, "").substring(0, 8);
}

export function generateTaskCode() {
  return `task-${uuidv4().replace(/-/g, "").substring(0, 3)}`;
}

export function generateUUID() {
  return uuidv4();
}

export function generateUniqueToken() {
  return uuidv4().replace(/-/g, "");
}

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
