import NextAuth, { DefaultSession } from "next-auth"
import { PaymentData } from "./types"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: Omit<PaymentData, {"cheque"}> //& DefaultSession["user"]
  }
}