const request = require('supertest');
const app = require('../server');
const { loginUser } = require('../scripts/authController');

// Mock the authController
jest.mock('../scripts/authController', () => ({
  loginUser: jest.fn()
}));

describe('POST /login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully and redirect to home', async () => {
    // Mock successful login
    loginUser.mockResolvedValue({
      username: 'testuser',
      firebase_uid: 'mock-uid'
    });

    const response = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(302); // Redirect status

    expect(response.header.location).toBe('/');
    expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should return 500 when login fails', async () => {
    // Mock failed login
    loginUser.mockRejectedValue(new Error('Invalid credentials'));

    const response = await request(app)
      .post('/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpass'
      })
      .expect(500);

    expect(response.text).toContain('Error logging in: Invalid credentials');
  });
});