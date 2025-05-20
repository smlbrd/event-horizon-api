import chai from 'chai';
import request from 'supertest';
import app from '../app';
import endpoints from '../../endpoints.json';

chai.should();

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
