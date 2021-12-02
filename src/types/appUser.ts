import { User } from "firebase/auth";
import { Member, Executive } from "types/db";

export type AppUser = User & {
  sid?: string;
  member?: Member;
  executive?: Executive;
};
