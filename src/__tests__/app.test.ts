import chai, { expect } from 'chai';
import request from 'supertest';
import app from '../app';
import db from '../db/connection';
import seed from '../db/seed';
import { userTestData } from '../db/testData/userTestData';
import { eventTestData } from '../db/testData/eventTestData';
import endpoints from '../../endpoints.json';
import {
  serverErrorHandler,
  notFoundErrorHandler,
} from '../middleware/errorHandler';

chai.should();

after(async () => {
  await db.end();
});

beforeEach(async () => {
  await seed({ userData: userTestData, eventData: eventTestData });
});

describe('Endpoints API', () => {
  it('should return 200 OK for the health check endpoint', async () => {
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
    it('should update a user', async () => {
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

    it('should return 404 when updating a non-existent user', async () => {
      const updateRes = await request(app)
        .patch('/api/users/99999')
        .send({ name: 'No One' })
        .expect(404);

      updateRes.body.should.have.property('message', 'User not found');
    });

    it('should delete a user', async () => {
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

    it('should return 404 when deleting a non-existent user', async () => {
      await request(app).delete('/api/users/99999').expect(404);
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

      res.body.should.have.property('id', eventId);
      res.body.should.have.property('title');
      res.body.should.have.property('description');
      res.body.should.have.property('location');
      res.body.should.have.property('price');
      res.body.should.have.property('start_time');
      res.body.should.have.property('end_time');
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
