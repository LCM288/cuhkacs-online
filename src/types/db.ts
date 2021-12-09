import type { CollegeCode } from "static/college.json";

export type Member = {
  sid: string;
  name: {
    chi?: string;
    eng: string;
  };
  gender?: string;
  dob?: string;
  email?: string;
  phone?: string;
  studentStatus: {
    college: CollegeCode;
    major: string;
    entryDate: string;
    gradDate: string;
  };
  memberStatus?: {
    since: number;
    lastRenewed: number;
    until: number;
  };
  createdAt: number;
  updatedAt: number;
};

export type Executive = {
  sid: string;
  displayName: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type MessageKey =
  | "library"
  | "welcome"
  | "member"
  | "expired"
  | "registered"
  | "visitor";

export type Message = {
  message: string;
  updatedAt: number;
};
