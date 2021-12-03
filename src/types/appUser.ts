import { Member, Executive } from "types/db";

export type AppUser = {
  sid: string;
  displayName: string;
  member: Member | null;
  executive: Executive | null;
};
