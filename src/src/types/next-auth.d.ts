import NextAuth, { DefaultSession } from "next-auth"


declare module "next-auth" {

  interface User extends UserModel {
    id: number,
    email: string,
    role: string,
    // paymentData: PaymentData
  }
  interface Session {
    user: User
  }
  type SessionUser = User
}