import { userDevData } from '../db/devData/userDevData';
import { eventDevData } from '../db/devData/eventDevData';
import { attendeeDevData } from '../db/devData/attendeeDevData';
import seed from './seed';
import db from './connection';

const runSeed = async () => {
  try {
    await seed({
      userData: userDevData,
      eventData: eventDevData,
      attendeeData: attendeeDevData,
    });
    console.log('Development database seeded successfully.');
  } catch (err) {
    console.error('Error seeding development database:', err);
  } finally {
    await db.end();
  }
};

runSeed();
