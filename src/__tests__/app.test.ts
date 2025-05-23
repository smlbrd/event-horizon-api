import chai, { expect } from 'chai';
import request from 'supertest';
import db from '../db/connection';
import seed from '../db/seed';
import { userTestData } from '../db/testData/userTestData';
import { eventTestData } from '../db/testData/eventTestData';
import { attendeeTestData } from '../db/testData/attendeeTestData';
import endpoints from '../../endpoints.json';
import app from '../app';
import { makeError } from '../utils/makeError';
import { checkExists } from '../utils/checkExists';
import {
  serverErrorHandler,
  notFoundErrorHandler,
} from '../middleware/errorHandler';

chai.should();

after(async () => {
  await db.end();
});

beforeEach(async () => {
  await seed({
    userData: userTestData,
    eventData: eventTestData,
    attendeeData: attendeeTestData,
  });
});

describe('Utility Functions', () => {
  describe('makeError', () => {
    it('should create an error with the given message and status', () => {
      const error = makeError('Test Error', 400);
      expect(error).to.have.property('message', 'Test Error');
      expect(error).to.have.property('status', 400);
    });
  });

  describe('checkExists', () => {
    it('should return true if the record exists', async () => {
      const exists = await checkExists('users', 1);
      expect(exists).to.be.true;
    });

    it('should return false if the record does not exist', async () => {
      const exists = await checkExists('users', 99999);
      expect(exists).to.be.false;
    });
  });
});

describe('General API', () => {
  it('should return 200 OK with endpoints details', async () => {
    const res = await request(app).get('/api').expect(200);
    res.body.should.have.property('endpoints');
    res.body.endpoints.should.deep.equal(endpoints);
  });

  it('should return 404 for non-existing endpoints', async () => {
    const res = await request(app)
      .get('/api/non-existing-endpoint')
      .expect(404);
    res.body.should.have.property('message').which.equals('Not Found');
  });
});

describe('User API', () => {
  describe('User creation and retrieval', () => {
    it('should create a user', async () => {
      const newUser = {
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
        name: 'test account',
        role: 'user',
      };
      const res = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      res.body.should.have.property('id');
      res.body.username.should.equal(newUser.username);
      res.body.email.should.equal(newUser.email);
      res.body.name.should.equal(newUser.name);
      res.body.role.should.equal(newUser.role);
      res.body.should.not.have.property('hashed_password');
    });

    it('should create a new user with hashed password', async () => {
      const newUser = {
        username: 'pin_lee',
        password: 'i_love_law',
        email: 'pinlee@preservationaux.com',
        name: 'Pin-Lee',
        role: 'user',
      };

      const res = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      res.body.should.have.property('id');
      res.body.username.should.equal(newUser.username);
      res.body.email.should.equal(newUser.email);
      res.body.name.should.equal(newUser.name);
      res.body.role.should.equal(newUser.role);
      res.body.should.not.have.property('hashed_password');
    });

    it('should retrieve an existing user', async () => {
      const userId = 1;

      const res = await request(app).get(`/api/users/${userId}`).expect(200);

      res.body.should.have.property('id', userId);
      res.body.should.have.property('username');
      res.body.should.have.property('email');
      res.body.should.have.property('name');
      res.body.should.have.property('role');
      res.body.should.not.have.property('hashed_password');
    });
  });

  describe('User API update and delete', () => {
    it('should update an existing user', async () => {
      const newUser = {
        username: 'update_me',
        password: 'password',
        email: 'update_me@example.com',
        name: 'Update Me',
        role: 'user',
      };
      const createRes = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);
      const userId = createRes.body.id;

      const updatedFields = {
        email: 'updated@example.com',
        name: 'Updated Name',
        role: 'staff',
      };
      const updateRes = await request(app)
        .patch(`/api/users/${userId}`)
        .send(updatedFields)
        .expect(200);

      updateRes.body.should.include({
        id: userId,
        email: updatedFields.email,
        name: updatedFields.name,
        role: updatedFields.role,
      });
    });

    it('should delete an existing user', async () => {
      const newUser = {
        username: 'delete_me',
        password: 'password',
        email: 'delete_me@example.com',
        name: 'Delete Me',
        role: 'user',
      };
      const createRes = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);
      const userId = createRes.body.id;

      await request(app).delete(`/api/users/${userId}`).expect(204);

      await request(app).get(`/api/users/${userId}`).expect(404);
    });
  });

  describe('User API error cases', () => {
    it('should return 404 for a non-existing user', async () => {
      const nonExistingUserId = 999;

      const res = await request(app)
        .get(`/api/users/${nonExistingUserId}`)
        .expect(404);

      res.body.should.have.property('message', 'User not found');
    });

    it('should return 404 when updating a non-existent user', async () => {
      const updateRes = await request(app)
        .patch('/api/users/99999')
        .send({ name: 'No One' })
        .expect(404);

      updateRes.body.should.have.property('message', 'User not found');
    });

    it('should return 404 when deleting a non-existent user', async () => {
      await request(app).delete('/api/users/99999').expect(404);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteUser = {
        username: 'usernamebutnopassword',
        email: 'usernamebutnopassword@example.com',
        name: 'Incomplete User',
        role: 'user',
      };

      const res = await request(app)
        .post('/api/users')
        .send(incompleteUser)
        .expect(400);

      res.body.should.have.property('message', 'Missing required user fields');
    });

    it('should return 409 if username or email already exists', async () => {
      const duplicateUser = {
        username: 'murderbot',
        password: 'sanctuary_moon',
        email: 'secunit238776431@thecompany.com',
        name: 'Murderbot',
        role: 'user',
      };

      const res = await request(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(409);

      res.body.should.have.property('message');
    });
  });

  describe('User API security', () => {
    it('should never return password or hashed_password fields in user responses', async () => {
      const newUser = {
        username: 'donotobservemypassword',
        password: 'supersecret',
        email: 'nopassword@example.com',
        name: 'Do Not Perceive It',
        role: 'user',
      };

      const createRes = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      createRes.body.should.not.have.property('password');
      createRes.body.should.not.have.property('hashed_password');

      const userId = createRes.body.id;
      const getRes = await request(app).get(`/api/users/${userId}`).expect(200);

      getRes.body.should.not.have.property('password');
      getRes.body.should.not.have.property('hashed_password');
    });

    it('should always create a user with role "user"', async () => {
      const newUser = {
        username: 'testuser2',
        password: 'testpassword',
        email: 'test2@example.com',
        name: 'Test2',
        role: 'staff',
      };
      const res = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      res.body.role.should.equal('user');
    });
  });
});

describe('Event API', () => {
  describe('Event creation and retrieval', () => {
    it('should retrieve all existing events', async () => {
      const res = await request(app).get('/api/events').expect(200);

      res.body.should.be.an('array');
      res.body.length.should.be.greaterThan(0);
      res.body[0].should.have.property('id');
      res.body[0].id.should.equal(1);
      res.body[2].should.have.property('title');
      res.body[2].title.should.equal('Planetary Survey');
    });

    it('should retrieve an existing event', async () => {
      const eventId = 1;

      const res = await request(app).get(`/api/events/${eventId}`).expect(200);

      res.body.id.should.equal(1);
      res.body.title.should.equal('Labour Contract Conclusion Party');
      res.body.description.should.equal("We're off this planet!");
      res.body.location.should.equal('Mining Station Aratake');
      res.body.price.should.equal(0);
      res.body.start_time.should.equal('2025-07-01T20:00:00.000Z');
      res.body.end_time.should.equal('2025-07-01T23:00:00.000Z');
    });

    it('should create a new event', async () => {
      const newEvent = {
        title: 'New Event',
        description: 'This is a new event',
        location: 'New Location',
        price: 100.0,
        start_time: '2025-08-01T10:00:00.000Z',
        end_time: '2025-08-01T12:00:00.000Z',
      };

      const res = await request(app)
        .post('/api/events')
        .send(newEvent)
        .expect(201);

      res.body.should.have.property('id');
      res.body.title.should.equal(newEvent.title);
      res.body.description.should.equal(newEvent.description);
      res.body.location.should.equal(newEvent.location);
      res.body.price.should.equal(newEvent.price);
      res.body.start_time.should.equal(newEvent.start_time);
      res.body.end_time.should.equal(newEvent.end_time);
    });

    it('should allow a new events with a price of 0', async () => {
      const newEvent = {
        title: 'Free Event',
        description: 'This event is free of charge',
        location: 'Free Location',
        price: 0.0,
        start_time: '2025-08-01T10:00:00.000Z',
        end_time: '2025-08-01T12:00:00.000Z',
      };

      const res = await request(app)
        .post('/api/events')
        .send(newEvent)
        .expect(201);

      res.body.should.have.property('id');
      res.body.title.should.equal(newEvent.title);
      res.body.description.should.equal(newEvent.description);
      res.body.location.should.equal(newEvent.location);
      res.body.price.should.equal(newEvent.price);
      res.body.start_time.should.equal(newEvent.start_time);
      res.body.end_time.should.equal(newEvent.end_time);
    });
  });

  describe('Event API update and delete', () => {
    it('should update an existing event', async () => {
      const newEvent = {
        title: 'Update Me',
        description: 'This event will be updated',
        location: 'Update Location',
        price: 50.0,
        start_time: '2025-08-01T10:00:00.000Z',
        end_time: '2025-08-01T12:00:00.000Z',
      };

      const createRes = await request(app)
        .post('/api/events')
        .send(newEvent)
        .expect(201);

      const eventId = createRes.body.id;

      const updatedFields = {
        title: 'Updated Event',
        description: 'This event has been updated',
        location: 'Updated Location',
        price: 75.0,
        start_time: '2025-08-01T14:00:00.000Z',
        end_time: '2025-08-01T16:00:00.000Z',
      };

      const updateRes = await request(app)
        .patch(`/api/events/${eventId}`)
        .send(updatedFields)
        .expect(200);

      updateRes.body.should.include({
        id: eventId,
        title: updatedFields.title,
        description: updatedFields.description,
        location: updatedFields.location,
        price: updatedFields.price,
        start_time: updatedFields.start_time,
        end_time: updatedFields.end_time,
      });
      updateRes.body.title.should.equal('Updated Event');
      updateRes.body.description.should.equal('This event has been updated');
      updateRes.body.location.should.equal('Updated Location');
      updateRes.body.price.should.equal(75);
      updateRes.body.start_time.should.equal('2025-08-01T14:00:00.000Z');
      updateRes.body.end_time.should.equal('2025-08-01T16:00:00.000Z');
    });

    it('should delete an existing event', async () => {
      const newEvent = {
        title: 'Delete Me',
        description: 'This event will be deleted',
        location: 'Delete Location',
        price: 50.0,
        start_time: '2025-08-01T10:00:00.000Z',
        end_time: '2025-08-01T12:00:00.000Z',
      };

      const createRes = await request(app)
        .post('/api/events')
        .send(newEvent)
        .expect(201);

      const eventId = createRes.body.id;

      await request(app).delete(`/api/events/${eventId}`).expect(204);

      await request(app).get(`/api/events/${eventId}`).expect(404);
    });
  });

  describe('Event API error cases', () => {
    it('should return 404 when fetching a non-existing event', async () => {
      const nonExistingEventId = 999;

      const res = await request(app)
        .get(`/api/events/${nonExistingEventId}`)
        .expect(404);

      res.body.should.have.property('message', 'Event not found');
    });

    it('should return 404 when updating a non-existent event', async () => {
      const updateRes = await request(app)
        .patch('/api/events/99999')
        .send({ title: 'No One' })
        .expect(404);
    });

    it('should return 404 when deleting a non-existent event', async () => {
      await request(app).delete('/api/events/99999').expect(404);
    });

    it('should return 400 when creating an event if required fields are missing', async () => {
      const incompleteEvent = {
        title: 'Incomplete Event',
        description: 'This event is missing required fields',
        location: 'Somewhere',
        price: 50.0,
        start_time: '2025-08-01T10:00:00.000Z',
      };

      const res = await request(app)
        .post('/api/events')
        .send(incompleteEvent)
        .expect(400);

      res.body.should.have.property('message', 'Missing required event fields');
    });

    it('should return 400 when updating an event if no fields are provided', async () => {
      const res = await request(app)
        .patch('/api/events/1')
        .send({})
        .expect(400);

      res.body.should.have.property('message', 'No fields provided for update');
    });
  });
});

describe('Attendee API', () => {
  describe('Attendee creation and retrieval', () => {
    it('should create an attendee for an event', async () => {
      const event_id = 3;

      const newAttendee = {
        user_id: 1,
        event_id: event_id,
        status: 'attending',
      };

      const res = await request(app)
        .post(`/api/events/${event_id}/attendees`)
        .send(newAttendee)
        .expect(201);

      res.body.should.have.property('id');
      res.body.user_id.should.equal(1);
      res.body.event_id.should.equal(event_id);
      res.body.status.should.equal('attending');
    });

    it('should retrieve all attendees for an event', async () => {
      const event_id = 2;

      const res = await request(app)
        .get(`/api/events/${event_id}/attendees`)
        .expect(200);

      res.body.should.be.an('array');
      res.body.length.should.equal(2);
      res.body[0].should.have.property('user_id');
      res.body[0].user_id.should.equal(1);
      res.body[0].should.have.property('status');
      res.body[0].status.should.equal('attending');
      res.body[0].should.have.property('event_id');
      res.body[0].event_id.should.equal(event_id);
    });
  });

  describe('Attendee API update and delete', () => {});

  describe('Attendee API error cases', () => {
    it('should return 404 when adding an attendee to a non-existent event', async () => {
      const newAttendee = {
        user_id: 1,
        event_id: 99999,
        status: 'attending',
      };

      const res = await request(app)
        .post('/api/events/99999/attendees')
        .send(newAttendee)
        .expect(404);

      res.body.should.have.property('message', 'Event not found');
    });

    it('should return 400 when creating an attendee if required fields are missing', async () => {
      const incompleteAttendee = {
        status: 'attending',
      };

      const res = await request(app)
        .post('/api/events/1/attendees')
        .send(incompleteAttendee)
        .expect(400);

      res.body.should.have.property('message', 'Missing required fields');
    });

    it('should return 409 if user is already attending the event', async () => {
      const newAttendee = {
        user_id: 1,
        event_id: 2,
        status: 'attending',
      };

      const res = await request(app)
        .post('/api/events/2/attendees')
        .send(newAttendee)
        .expect(409);

      res.body.should.have.property('message', 'User already attending');
    });
    it('should return 400 when adding an attendee with invalid status', async () => {
      const event_id = 3;

      const newAttendee = {
        user_id: 1,
        event_id: event_id,
        status: 'invalid_status',
      };

      const res = await request(app)
        .post(`/api/events/${event_id}/attendees`)
        .send(newAttendee)
        .expect(400);

      res.body.should.have.property('message', 'Invalid status');
    });
  });
});

describe('errorHandler middleware', () => {
  it('serverErrorHandler returns 500 and default message if no status/message on error', () => {
    let statusCode: number | undefined;
    let jsonResponse: any;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(obj: any) {
        jsonResponse = obj;
      },
    };

    serverErrorHandler({} as any, {} as any, res as any, () => {});

    expect(statusCode).to.equal(500);
    expect(jsonResponse).to.deep.equal({ message: 'Internal Server Error' });
  });

  it('serverErrorHandler uses error status and message if provided', () => {
    let statusCode: number | undefined;
    let jsonResponse: any;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(obj: any) {
        jsonResponse = obj;
      },
    };

    serverErrorHandler(
      { status: 404, message: 'Not Found' },
      {} as any,
      res as any,
      () => {}
    );

    expect(statusCode).to.equal(404);
    expect(jsonResponse).to.deep.equal({ message: 'Not Found' });
  });

  it('notFoundErrorHandler returns 404 and "Not Found" message', () => {
    let statusCode: number | undefined;
    let jsonResponse: any;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(obj: any) {
        jsonResponse = obj;
      },
    };

    notFoundErrorHandler({} as any, res as any, () => {});

    expect(statusCode).to.equal(404);
    expect(jsonResponse).to.deep.equal({ message: 'Not Found' });
  });
});
