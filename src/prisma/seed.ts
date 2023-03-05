import { PriceRange, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const createSquareVenueRows = (rowsCount: number, colsCount: number) => {
  const rows: any = { create: [] }

  for (let i = 1; i <= rowsCount; i++) {
    const tickets: any = { create: [] }
    for (let j = 1; j <= colsCount; j++) {
      tickets.create.push({ number: String(j) })
    }
    rows.create.push({
      number: i,
      tickets: tickets
    })
  }

  return rows
}

const createVenueByRows = (_rows: { priceRange: PriceRange, ticketCount: number }[]) => {
  const rows: any = { create: [] }

  for (let i = 0; i <= _rows.length - 1; i++) {
    const tickets: any = { create: [] }
    for (let j = 1; j <= _rows[i].ticketCount; j++) {
      tickets.create.push({
        number: String(j),
        sortNumber: j,
        priceRange: {
          connect: {
            id: _rows[i].priceRange.id
          }
        }
      })
    }
    rows.create.push({
      number: i + 1,
      tickets: tickets
    })
  }

  // console.log(rows)
  return rows
}

async function main() {
  console.log("Creating users and roles")

  await prisma.role.createMany({ data: [{ name: "customer" }, { name: "admin" }] })

  const adminRole = await prisma.role.findFirst({ where: { name: "admin" } })

  if (adminRole) {
    await prisma.user.create({
      data: {
        email: "gworlds@gmail.com",
        name: "admin",
        nickname: "admin",
        age: 99,
        role: {
          connect: {
            id: adminRole.id
          }
        },
        passwords: {
          create: {
            hash: bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD ?? "secret", 10)
          }
        }
      }
    })

    await prisma.user.create({
      data: {
        email: "everilion@gmail.com",
        name: "admin",
        nickname: "admin",
        age: 99,
        role: {
          connect: {
            id: adminRole.id
          }
        },
        passwords: {
          create: {
            hash: bcrypt.hashSync("secret", 10)
          }
        }
      }
    })

  }
  const customerRole = await prisma.role.findFirst({ where: { name: "customer" } })

  if (customerRole)
    await prisma.user.create({
      data: {
        email: "g-worlds@ya.ru",
        name: "testUser",
        nickname: "tester",
        age: 20,
        role: {
          connect: {
            id: customerRole.id
          }
        }
      }
    })

  console.log("Creating price ranges")

  await prisma.priceRange.createMany({
    data: [
      {
        name: "Зона 1",
        price: 1000,
      },
      {
        name: "Зона 2",
        price: 2000
      },
      {
        name: "Зона 3",
        price: 3000
      }
    ]
  })

  const priceRanges = await prisma.priceRange.findMany()
  // console.log(priceRanges)
  console.log("Creating venue and tickets")

  const rows = [
    { priceRange: priceRanges[2], ticketCount: 21 },
    { priceRange: priceRanges[2], ticketCount: 22 },
    { priceRange: priceRanges[2], ticketCount: 23 },
    { priceRange: priceRanges[2], ticketCount: 25 },
    { priceRange: priceRanges[2], ticketCount: 26 },
    { priceRange: priceRanges[2], ticketCount: 27 },
    { priceRange: priceRanges[2], ticketCount: 28 },
    { priceRange: priceRanges[2], ticketCount: 28 },
    { priceRange: priceRanges[2], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[1], ticketCount: 28 },
    { priceRange: priceRanges[0], ticketCount: 28 },
    { priceRange: priceRanges[0], ticketCount: 28 },
    { priceRange: priceRanges[0], ticketCount: 28 },
  ]

  // const rows = [
  //   { priceRange: priceRanges[0], ticketCount: 2 }
  // ]
  await prisma.venue.create({
    data: {
      name: "ОДНТ",
      rows: createVenueByRows(rows)
    }
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    // process.exit(1)
  })