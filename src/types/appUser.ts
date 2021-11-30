import { User } from "firebase/auth";
import { Member, Executive } from "types/db";

export type AppUser = User & {
  member?: Member;
  executive?: Executive;
};
