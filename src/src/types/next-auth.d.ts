import NextAuth, { DefaultSession } from "next-auth"
import { PaymentData } from "./types"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  // export interface SessionUser {
  //   id: number,
  //   email: string,
  //   role: string
  // } //& DefaultSession["user"]
  interface User extends UserModel {
    id: number,
    email: string,
    role: string
  }
  interface Session {
    user: User
  }
  type SessionUser = User
}