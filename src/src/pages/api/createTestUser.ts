import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.query.email) {
    const user = await prisma.user.create({
        data: {
          name: 'Alice',
          email: req.query.email as string,
          nickname: "Acya",
          age: 13,
          roleId: 1
        },
      })
      console.log(user)
    }
    res.status(200).end()
}