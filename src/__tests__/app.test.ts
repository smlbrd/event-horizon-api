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
import { hashPassword } from '../utils/hashPassword';
import { comparePassword } from '../utils/comparePassword';
import jwt from 'jsonwebtoken';

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

describe('General API', () => {
  it('should return 200 OK for health check', async () => {
    await request(app).get('/api/health').expect(200);
  });

  it('should return 200 OK with endpoints details', async () => {
    const res = await request(app).get('/api').expect(200);
    res.body.should.have.property('endpoints');
    res.body.endpoints.should.deep.equal(endpoints);
  });

  it('should return 404 for non-existing endpoints', async () => {
    const res = await request(app)
      .get('/api/non-existing-endpoint')
      .expect(404);

    res.body.should.have.property('message', 'Not Found');
  });
});

describe('Utility Functions & Middleware', () => {
  describe('makeError utility function', () => {
    it('should create an error with the given message and status', () => {
      const error = makeError('Test Error', 400);
      expect(error).to.have.property('message', 'Test Error');
      expect(error).to.have.property('status', 400);
    });
  });

  describe('checkExists utility function', () => {
    it('should return true if the record exists', async () => {
      const exists = await checkExists('users', '1');
      expect(exists).to.be.true;
    });

    it('should return false if the record does not exist', async () => {
      const exists = await checkExists('users', '99999');
      expect(exists).to.be.false;
    });
  });

  describe('hashPassword utility function', () => {
    it('should hash a password', async () => {
      const password = 'testpasswordtest';
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).to.be.a('string');
      expect(hashedPassword.length).to.be.greaterThan(20);
      expect(hashedPassword).to.not.equal(password);
    });
  });

  describe('comparePassword utility function', () => {
    it('should compare a plain password with a hashed password', async () => {
      const password = 'testpasswordtest';
      const hashedPassword = await hashPassword(password);
      const match = await comparePassword(password, hashedPassword);
      expect(match).to.be.true;
    });

    it('should return false for incorrect passwords', async () => {
      const password = 'testpasswordtest';
      const hashedPassword = await hashPassword(password);
      const match = await comparePassword('wrongpassword', hashedPassword);
      expect(match).to.be.false;
    });
  });

  describe('validateEmail utility function', () => {
    it('should return 400 if email is invalid', async () => {
      const newUser = {
        email: 'notanemail',
        password: 'averysecurepassword',
      };

      const res = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(400);

      expect(res.body).to.have.property('message', 'Invalid email format');
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
});

describe('User API', () => {
  describe('User creation and retrieval', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'testpasswordtest',
        role: 'user',
      };
      const res = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(201);

      res.body.should.have.property('id');
      res.body.should.have.property('email', newUser.email);
      res.body.should.have.property('role', newUser.role);
      res.body.should.not.have.property('hashed_password');
    });

    it('should create a new user with hashed password', async () => {
      const newUser = {
        email: 'pinlee@preservationaux.com',
        password: 'KillJoyBloodLustTechRiot',
        role: 'user',
      };

      const res = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(201);

      res.body.should.have.property('id', 4);
      res.body.should.have.property('email', newUser.email);
      res.body.should.have.property('role', newUser.role);
      res.body.should.not.have.property('password');
      res.body.should.not.have.property('hashed_password');
    });

    it('should retrieve an existing user', async () => {
      const userId = 1;

      const res = await request(app).get(`/api/users/${userId}`).expect(200);

      res.body.should.have.property('id', userId);
      res.body.should.have.property('email');
      res.body.should.have.property('role');
      res.body.should.not.have.property('hashed_password');
    });
  });

  describe('User API update and delete', () => {
    it('should update an existing user', async () => {
      const newUser = {
        email: 'update_me@example.com',
        password: 'testpasswordtest',
      };
      const createRes = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(201);
      const userId = createRes.body.id;

      const updatedFields = {
        email: 'updatedemailaddress@example.com',
      };

      const updateRes = await request(app)
        .patch(`/api/users/${userId}`)
        .send(updatedFields)
        .expect(200);

      updateRes.body.should.have.property('id', userId);
      updateRes.body.should.have.property('email', updatedFields.email);
    });

    it('should delete an existing user', async () => {
      const newUser = {
        email: 'delete_me@example.com',
        password: 'testpasswordtest',
      };
      const createRes = await request(app)
        .post('/api/register')
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
        .send({ email: 'nobody@nowhere.com' })
        .expect(404);

      updateRes.body.should.have.property('message', 'User not found');
    });

    it('should return 404 when deleting a non-existent user', async () => {
      await request(app).delete('/api/users/99999').expect(404);
    });

    it('should return 400 when creating a user if required fields are missing', async () => {
      const incompleteUser = {
        email: 'emailbutnopassword@example.com',
      };

      const res = await request(app)
        .post('/api/register')
        .send(incompleteUser)
        .expect(400);

      res.body.should.have.property('message', 'Missing required user fields');
    });

    it('should return 400 if password is too short', async () => {
      const newUser = {
        email: 'short@example.com',
        password: '123',
      };

      const res = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(400);

      expect(res.body).to.have.property(
        'message',
        'Password must be between 15 and 128 characters'
      );
    });

    it('should return 400 if password is too long', async () => {
      const newUser = {
        email: 'long@example.com',
        password: 'a'.repeat(130),
      };

      const res = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(400);

      expect(res.body).to.have.property(
        'message',
        'Password must be between 15 and 128 characters'
      );
    });

    it('should return 409 when creating a user if email already exists', async () => {
      const duplicateUser = {
        email: 'secunit238776431@thecompany.com',
        password: 'sanctuary_moon123',
      };

      const res = await request(app)
        .post('/api/register')
        .send(duplicateUser)
        .expect(409);

      res.body.should.have.property(
        'message',
        'An account with this email already exists'
      );
    });
  });

  describe('User API security', () => {
    it('should store a hashed password, not the plain password', async () => {
      const secureUser = {
        email: 'test@example.com',
        password: 'plaintextpassword',
      };

      const res = await request(app)
        .post('/api/register')
        .send(secureUser)
        .expect(201);

      const userId = res.body.id;

      const result = await db.query(
        'SELECT hashed_password FROM users WHERE id = $1',
        [userId]
      );

      expect(result.rows).to.have.lengthOf(1);

      const hashPass = result.rows[0].hashed_password;
      expect(hashPass).to.be.a('string');
      expect(hashPass).to.not.equal(secureUser.password);
      expect(hashPass.length).to.be.greaterThan(20);
    });

    it('should never return password or hashed_password fields in user responses', async () => {
      const newUser = {
        email: 'nopassword@example.com',
        password: 'supersecretpassword',
      };

      const createRes = await request(app)
        .post('/api/register')
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
        email: 'test2@example.com',
        password: 'testpasswordtest',
        role: 'staff',
      };
      const res = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(201);

      res.body.should.have.property('role', 'user');
    });
  });
});

describe('Authentication API', () => {
  describe('User login', () => {
    it('should verify a plain password against the stored hashed password', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'testpasswordtest',
      };

      await request(app).post('/api/register').send(newUser).expect(201);

      const loginRes = await request(app)
        .post('/api/login')
        .send({ email: newUser.email, password: newUser.password })
        .expect(200);

      expect(loginRes.body).to.have.property('message', 'Login successful');
      expect(loginRes.body).to.have.property('user');
      expect(loginRes.body.user).to.have.property('email', newUser.email);

      const failRes = await request(app)
        .post('/api/login')
        .send({ email: newUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(failRes.body).to.have.property(
        'message',
        'Incorrect email or password'
      );
    });

    it('should return a JWT on successful login', async () => {
      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      expect(loginRes.body).to.have.property('token');
      const decoded = jwt.verify(loginRes.body.token, process.env.JWT_SECRET!);
      expect(decoded).to.have.property('userId');
      expect(decoded).to.have.property('email', 'mensah@preservationaux.com');
    });

    it('should allow access to protected route with valid token', async () => {
      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;

      const protectedRes = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(protectedRes.body).to.have.property('message', 'You have access!');
      expect(protectedRes.body.user).to.have.property(
        'email',
        'mensah@preservationaux.com'
      );
    });
  });

  describe('User login error cases', () => {
    it('should return 400 when email or password is missing', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'mensah@preservationaux.com', password: '' })
        .expect(400);

      res.body.should.have.property('message', 'Missing email or password');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'nonexistent@nowhere.com', password: 'wrongpassword' })
        .expect(401);

      res.body.should.have.property('message', 'Incorrect email or password');
    });

    it('should return 401 when trying to access to protected route without token', async () => {
      await request(app).get('/api/protected').expect(401);
    });

    it('should return 403 for invalid token', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(403);

      expect(res.body).to.have.property('message', 'Invalid token');
    });
  });
});

describe('Event API', () => {
  describe('Event creation and retrieval', () => {
    it('should retrieve all existing events', async () => {
      const res = await request(app).get('/api/events').expect(200);

      res.body.should.be.an('array');
      res.body.length.should.be.greaterThan(0);
      res.body[0].should.have.property('id', 1);
      res.body[2].should.have.property('title', 'Planetary Survey');
    });

    it('should retrieve an existing event', async () => {
      const eventId = 1;

      const res = await request(app).get(`/api/events/${eventId}`).expect(200);

      res.body.should.have.property('id', 1);
      res.body.should.have.property(
        'title',
        'Labour Contract Conclusion Party'
      );
      res.body.should.have.property('description', "We're off this planet!");
      res.body.should.have.property('location', 'Mining Station Aratake');
      res.body.should.have.property('price', 0);
      res.body.should.have.property('start_time', '2025-07-01T20:00:00.000Z');
      res.body.should.have.property('end_time', '2025-07-01T23:00:00.000Z');
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

      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;
      if (!token) throw new Error('No token returned from login');

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(newEvent)
        .expect(201);

      createRes.body.should.have.property('id');
      createRes.body.should.have.property('title', newEvent.title);
      createRes.body.should.have.property('description', newEvent.description);
      createRes.body.should.have.property('location', newEvent.location);
      createRes.body.should.have.property('price', newEvent.price);
      createRes.body.should.have.property('start_time', newEvent.start_time);
      createRes.body.should.have.property('end_time', newEvent.end_time);
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

      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(newEvent)
        .expect(201);

      res.body.should.have.property('id');
      res.body.should.have.property('title', newEvent.title);
      res.body.should.have.property('description', newEvent.description);
      res.body.should.have.property('location', newEvent.location);
      res.body.should.have.property('price', newEvent.price);
      res.body.should.have.property('start_time', newEvent.start_time);
      res.body.should.have.property('end_time', newEvent.end_time);
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

      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;
      if (!token) throw new Error('No token returned from login');

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .send(updatedFields)
        .expect(200);

      updateRes.body.should.have.property('id', eventId);
      updateRes.body.should.have.property('title', updatedFields.title);
      updateRes.body.should.have.property(
        'description',
        updatedFields.description
      );
      updateRes.body.should.have.property('location', updatedFields.location);
      updateRes.body.should.have.property('price', updatedFields.price);
      updateRes.body.should.have.property(
        'start_time',
        updatedFields.start_time
      );
      updateRes.body.should.have.property('end_time', updatedFields.end_time);
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

      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;
      if (!token) throw new Error('No token returned from login');

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(newEvent)
        .expect(201);

      const eventId = createRes.body.id;

      await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

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
      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;
      if (!token) throw new Error('No token returned from login');

      const eventId = '99999';

      await request(app)
        .patch(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'No One' })
        .expect(404);
    });

    it('should return 404 when deleting a non-existent event', async () => {
      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;
      if (!token) throw new Error('No token returned from login');

      await request(app)
        .delete('/api/events/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 400 when creating an event if required fields are missing', async () => {
      const incompleteEvent = {
        title: 'Incomplete Event',
        description: 'This event is missing required fields',
        location: 'Somewhere',
        price: 50.0,
        start_time: '2025-08-01T10:00:00.000Z',
      };

      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;
      if (!token) throw new Error('No token returned from login');

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteEvent)
        .expect(400);

      createRes.body.should.have.property(
        'message',
        'Missing required event fields'
      );
    });

    it('should return 400 when updating an event if no fields are provided', async () => {
      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;
      if (!token) throw new Error('No token returned from login');

      const res = await request(app)
        .patch('/api/events/1')
        .set('Authorization', `Bearer ${token}`)
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
      res.body.should.have.property('user_id', 1);
      res.body.should.have.property('event_id', event_id);
      res.body.should.have.property('status', 'attending');
    });

    it('should retrieve all attendees for an event', async () => {
      const event_id = 2;

      const res = await request(app)
        .get(`/api/events/${event_id}/attendees`)
        .expect(200);

      res.body.should.be.an('array');
      res.body.length.should.equal(2);
      res.body[0].should.have.property('user_id', 1);
      res.body[0].should.have.property('status', 'attending');
      res.body[0].should.have.property('event_id', event_id);
    });

    it('should return an empty array if no attendees for an event', async () => {
      const event_id = 3;
      const res = await request(app)
        .get(`/api/events/${event_id}/attendees`)
        .expect(200);
      res.body.should.be.an('array');
      res.body.should.be.empty;
    });

    it('should retrieve all events for a user', async () => {
      const user_id = 1;

      const res = await request(app)
        .get(`/api/users/${user_id}/events`)
        .expect(200);

      res.body.should.be.an('array');
      res.body.length.should.equal(2);
      res.body[0].should.have.property('id', 1);
      res.body[0].should.have.property(
        'title',
        'Labour Contract Conclusion Party'
      );
    });

    it('should return an empty array if no events for a user', async () => {
      const user_id = 3;

      const res = await request(app)
        .get(`/api/users/${user_id}/events`)
        .expect(200);

      res.body.should.be.an('array');
      res.body.should.be.empty;
    });
  });

  describe('Attendee API update and delete', () => {
    it('should allow a user to cancel their RSVP (set status to cancelled)', async () => {
      const event_id = 2;
      const user_id = 1;

      const res = await request(app)
        .patch(`/api/events/${event_id}/attendees/${user_id}`)
        .send({ status: 'cancelled' })
        .expect(200);

      res.body.should.have.property('user_id', user_id);
      res.body.should.have.property('event_id', event_id);
      res.body.should.have.property('status', 'cancelled');
    });

    it('should allow a user to change their RSVP status after cancelling (set status to attending)', async () => {
      const event_id = 2;
      const user_id = 1;

      const res = await request(app)
        .patch(`/api/events/${event_id}/attendees/${user_id}`)
        .send({ status: 'attending' })
        .expect(200);

      res.body.should.have.property('user_id', user_id);
      res.body.should.have.property('event_id', event_id);
      res.body.should.have.property('status', 'attending');
    });
  });

  describe('Attendee API error cases', () => {
    it('should return 404 when adding attendee for a non-existent user', async () => {
      const event_id = 2;
      const newAttendee = {
        user_id: 99999,
        event_id,
        status: 'attending',
      };

      const res = await request(app)
        .post(`/api/events/${event_id}/attendees`)
        .send(newAttendee)
        .expect(404);

      res.body.should.have.property('message', 'User not found');
    });
    it('should return 404 when adding attendee for a non-existent event', async () => {
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

    it('should return 404 when fetching attendees for a non-existent event', async () => {
      const res = await request(app)
        .get('/api/events/99999/attendees')
        .expect(404);

      res.body.should.have.property('message', 'Event not found');
    });

    it('should return 404 when adding user to a non-existent event', async () => {
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

    it('should return 404 if updating attendee status for a non-existent user', async () => {
      const event_id = 1;
      const user_id = 99999;

      const res = await request(app)
        .patch(`/api/events/${event_id}/attendees/${user_id}`)
        .send({ status: 'cancelled' })
        .expect(404);

      res.body.should.have.property('message', 'User not found');
    });

    it('should return 404 if updating status for a user who is not attending', async () => {
      const event_id = 3;
      const user_id = 2;

      const res = await request(app)
        .patch(`/api/events/${event_id}/attendees/${user_id}`)
        .send({ status: 'cancelled' })
        .expect(404);

      res.body.should.have.property('message', 'Attendee not found');
    });

    it('should return 404 when fetching attendees for a deleted event', async () => {
      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'mensah@preservationaux.com',
          password: 'preservationalliance',
        })
        .expect(200);

      const token = loginRes.body.token;
      if (!token) throw new Error('No token returned from login');

      const event_id = 1;

      await request(app)
        .delete(`/api/events/${event_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const res = await request(app)
        .get(`/api/events/${event_id}/attendees`)
        .expect(404);

      res.body.should.have.property('message', 'Event not found');
    });

    it('should return 404 when fetching events for a deleted user', async () => {
      const user_id = 1;

      await request(app).delete(`/api/users/${user_id}`).expect(204);

      const res = await request(app)
        .get(`/api/users/${user_id}/events`)
        .expect(404);

      res.body.should.have.property('message', 'User not found');
    });

    it('should return 409 if adding an attendee who is already attending an event', async () => {
      const newAttendee = {
        user_id: 1,
        event_id: 2,
        status: 'attending',
      };

      const res = await request(app)
        .post(`/api/events/2/attendees`)
        .send(newAttendee)
        .expect(409);

      res.body.should.have.property('message', 'User already attending');
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

    it('should return 400 when updating an attendee with invalid status', async () => {
      const event_id = 2;
      const user_id = 1;

      const res = await request(app)
        .patch(`/api/events/${event_id}/attendees/${user_id}`)
        .send({ status: 'not_a_status' })
        .expect(400);

      res.body.should.have.property('message', 'Invalid status');
    });

    it('should return 400 when updating an attendee with missing status', async () => {
      const event_id = 2;
      const user_id = 1;

      const res = await request(app)
        .patch(`/api/events/${event_id}/attendees/${user_id}`)
        .send({})
        .expect(400);

      res.body.should.have.property('message', 'Invalid status');
    });
  });
});
