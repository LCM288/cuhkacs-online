export type RegistrationListRow = {
  sid: string;
  chineseName: string | undefined;
  englishName: string;
  gender: string | undefined;
  dateOfBirth: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  college: string;
  major: string;
  dateOfEntry: string;
  expectedGraduationDate: string;
  action: "Registration";
};

export type MemberListRow = {
  sid: string;
  chineseName: string | undefined;
  englishName: string;
  gender: string | undefined;
  dateOfBirth: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  college: string;
  major: string;
  dateOfEntry: string;
  expectedGraduationDate: string;
  memberSince: string;
  lastRenewed: string;
  memberUntil: string;
  action: "Member";
};

export type AdminListRow = {
  sid: string;
};

export type MessageKey =
  | "welcome"
  | "member"
  | "expired"
  | "registered"
  | "visitor";

export type EditMessageListRow = {
  key: MessageKey;
  desc: string;
  type: "string" | "richtext";
  value: string;
};
