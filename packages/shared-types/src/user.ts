export type UserRole = "user" | "admin";
export type UserStatus = "INACTIVE" | "ACTIVE" | "BLOCKED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}
