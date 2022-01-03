import { Member } from "types/db";
import { DateTime } from "luxon";

type MemberStatus =
  | "Activated"
  | "PG Member"
  | "Expired"
  | "Registered"
  | "Incomplete";

export type PartialMember = Partial<
  Pick<Member, "sid" | "gender" | "dob" | "email" | "phone">
> & {
  name: Partial<Member["name"]>;
  studentStatus: Partial<Member["studentStatus"]>;
  memberStatus?: Partial<Member["memberStatus"]>;
};

export const getMemberStatus = (member: PartialMember): MemberStatus => {
  if (
    !member.sid ||
    !member.name?.eng ||
    !member.studentStatus?.college ||
    !member.studentStatus?.major ||
    !member.studentStatus?.entryDate ||
    !member.studentStatus?.gradDate
  ) {
    return "Incomplete";
  }
  if (!member.memberStatus) {
    return "Registered";
  }
  if (!member.memberStatus?.since || !member.memberStatus?.until) {
    return "Incomplete";
  }
  if (DateTime.now().valueOf() > member.memberStatus.until) {
    return "Expired";
  }
  if (member.studentStatus.college === "NO") {
    return "PG Member";
  }
  return "Activated";
};

export const lengthLimits = {
  sid: 15,
  name: {
    chi: 63,
    eng: 127,
  },
  email: 323,
  phone: 63,
  studentStatus: {
    major: 127,
  },
};

export const patternLimits = {
  sid: /^\d*$/,
  gender: /^((fe)?male|other)$/,
  email: /^.+@.+$/,
  phone: /^\+?\d+(-\d+)*$/,
  studentStatus: {
    college: /^(CC|NA|UC|SC|WYS|WS|SH|MC|CW|NO)$/,
    major: /^.+$/,
  },
};
