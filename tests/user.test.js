import request from 'supertest';
import app from '../src/index.js';
import mongoose from 'mongoose';

describe('User API', () => {
  let userId;

  beforeAll(async () => {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL);
    }
    // Wait a bit for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterEach(async () => {
    // Clean up after each test
    if (userId) {
      try {
        await mongoose.connection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it('should create a new user', async () => {
    const uniqueEmail = `salam${Date.now()}@gmail.com`;
    const uniquePhone = `${Math.floor(Math.random() * 10000000000)}`;
    
    const res = await request(app)
      .post('/users')
      .send({
        username: 'salam',
        email: uniqueEmail,
        password: '123456',
        role: 'admin',
        phoneNumber: uniquePhone
      });
    
    if (res.statusCode !== 201) {
      console.error('Create user error:', res.body);
    }
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    userId = res.body._id;
  }, 10000); // Increase timeout to 10 seconds

  it('should get a user by id', async () => {
    expect(userId).toBeDefined();
    const res = await request(app).get(`/users/${userId}`);
    if (res.statusCode !== 200) {
      console.error('Get user error:', res.body);
    }
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'salam');
  });

  it('should update a user', async () => {
    expect(userId).toBeDefined();
    const res = await request(app)
      .put(`/users/${userId}`)
      .send({ username: 'updateduser' });
    if (res.statusCode !== 200) {
      console.error('Update user error:', res.body);
    }
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'updateduser');
  });

  it('should delete a user', async () => {
    expect(userId).toBeDefined();
    const res = await request(app).delete(`/users/${userId}`);
    if (res.statusCode !== 200) {
      console.error('Delete user error:', res.body);
    }
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User deleted');
  });

  afterAll(async () => {
    // Clean up any remaining test data
    try {
      await mongoose.connection.collection('users').deleteMany({});
    } catch (error) {
      // Ignore cleanup errors
    }
    await mongoose.connection.close();
  });
});
