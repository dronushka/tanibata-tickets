import { PrismaClient } from "@prisma/client";
import createUsers from "./seed/createUsers";
import createVenueShowDay1 from "./seed/day1/createVenue";
import createVenueShowDay2 from "./seed/day2/createVenue";
import createVenueConcert from "./seed/concert/createVenue";
import createVenueGoodness from "./seed/goodness/createVenue";
import createVenueYellowBoat from "./seed/yellowBoat/createVenue";
import createVenueBlueBoat from "./seed/blueBoat/createVenue";

const prisma = new PrismaClient();

async function main() {
  console.log(process.cwd())

  console.log("Creating users");
  await createUsers();
  console.log("Done");

  console.log("Creating venues");
  await createVenueShowDay1();
  await createVenueShowDay2();
  await createVenueConcert();
  await createVenueGoodness();
  await createVenueYellowBoat();
  await createVenueBlueBoat();
  console.log("Done");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // process.exit(1)
  });
