import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createSquareVenueRows = (rowsCount: number, colsCount: number) => {
  const rows: any = { create: [] }

  for (let i = 1; i <= rowsCount; i++) {
    const tickets: any = { create: [] }
    for (let j = 1; j <= colsCount; j++) {
      tickets.create.push({ number: String(j)})
    }
    rows.create.push({
      number: i,
      tickets: tickets
    })
  }

  return rows
}

const createVenueByRows = ( _rows: Array<{price: number, ticketCount: number}> ) => {
  const rows: any = { create: [] }

  for (let i = 0; i <= _rows.length - 1; i++) {
    const tickets: any = { create: [] }
    for (let j = 1; j <= _rows[i].ticketCount; j++) {
      tickets.create.push({ number: String(j)})
    }
    rows.create.push({
      number: i + 1,
      tickets: tickets
    })
  }

  console.log(rows)
  return rows
}

async function main() {
  await prisma.role.createMany({ data: [ { name: "customer" }, { name: "admin" } ] })

  const adminRole = await prisma.role.findFirst({ where: { name: "admin" } })

  if (adminRole)
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
        }
      }
    })

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

  const rows = [
    { price: 1, ticketCount: 21},
    { price: 1, ticketCount: 22},
    { price: 1, ticketCount: 23},
    { price: 1, ticketCount: 25},
    { price: 1, ticketCount: 26},
    { price: 1, ticketCount: 27},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
    { price: 1, ticketCount: 28},
  ]
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
    process.exit(1)
  })