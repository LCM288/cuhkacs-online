import { useContext } from "react";
import { UserContext } from "app";
import { Member, Executive } from "types/db";

export type UserStatus = {
  sid: string;
  displayName: string | null;
  member?: Member;
  executive?: Executive;
  // The following four are mutually exclusive.
  isActive: boolean;
  isExpired: boolean;
  isRegistered: boolean;
  isVisitor: boolean;
};

const useUserStatus = (): UserStatus | null => {
  const user = useContext(UserContext);
  if (!user?.sid) {
    return null;
  }
  const sid = user.sid;
  const displayName = user.displayName;
  const executive = user.executive;
  const member = user.member;
  const now = new Date().valueOf();
  if (!user.member) {
    return {
      sid,
      displayName,
      executive,
      member,
      isActive: false,
      isExpired: false,
      isRegistered: false,
      isVisitor: true,
    };
  }
  if (!user.member.memberStatus || user.member.memberStatus.since > now) {
    return {
      sid,
      displayName,
      executive,
      member,
      isActive: false,
      isExpired: false,
      isRegistered: true,
      isVisitor: false,
    };
  }
  const isActive =
    user.member.memberStatus.until > now &&
    now > user.member.memberStatus.since;
  const isExpired = user.member.memberStatus.until < now;
  return {
    sid,
    displayName,
    executive,
    member,
    isActive,
    isExpired,
    isRegistered: false,
    isVisitor: false,
  };
};

export default useUserStatus;
