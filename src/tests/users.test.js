const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { addToken } = require('../store/tokenStore');
const { register, login, logout, getProfile, updateProfile, deleteProfile } = require('../controllers/userController');

// Mocking Express response and request
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
};

const mockRequest = (body = {}, params = {}, headers = {}, user = {}) => ({
  body,
  params,
  headers,
  user,
});

// Mock dependencies
jest.mock('../models/userModel');
jest.mock('../store/tokenStore');
jest.mock('jsonwebtoken');

describe('User Controller', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = 'mockAccessToken';
    jwt.sign.mockReturnValue(token);
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const req = mockRequest({ username: 'testuser', email: 'test@example.com', password: 'password123' });
      const res = mockResponse();

      User.prototype.save.mockResolvedValueOnce();

      await register(req, res);

      expect(User.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith('User registered successfully');
    });

    it('should return 400 if registration fails', async () => {
      const req = mockRequest({ username: 'testuser', email: 'test@example.com', password: 'password123' });
      const res = mockResponse();

      User.prototype.save.mockRejectedValueOnce(new Error('Registration error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: 'Registration error' });
    });
  });

  describe('login', () => {
    it('should log in a user successfully and return a token', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'password123' });
      const res = mockResponse();

      const mockUser = {
        _id: 'testUserId',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValueOnce(true),
      };
      User.findOne.mockResolvedValueOnce(mockUser);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(jwt.sign).toHaveBeenCalledWith({ id: mockUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged in successfully' });
    });

    it('should return 401 for invalid credentials', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'wrongpassword' });
      const res = mockResponse();

      const mockUser = {
        _id: 'testUserId',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValueOnce(false),
      };
      User.findOne.mockResolvedValueOnce(mockUser);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('Invalid email or password');
    });

    it('should return 400 if login fails due to database issues', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'password123' });
      const res = mockResponse();

      User.findOne.mockRejectedValueOnce(new Error('Database error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Database error');
    });
  });

  describe('logout', () => {
    it('should add the token to the blacklist and log out the user', () => {
      const req = mockRequest({}, {}, { authorization: 'Bearer mockAccessToken' });
      const res = mockResponse();

      logout(req, res);

      expect(addToken).toHaveBeenCalledWith('Bearer mockAccessToken');
      expect(res.send).toHaveBeenCalledWith('Logged out successfully');
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const req = mockRequest({}, {}, {}, { id: 'testUserId' });
      const res = mockResponse();

      const mockUser = { _id: 'testUserId', username: 'testuser', email: 'test@example.com' };
      User.findById.mockResolvedValueOnce(mockUser);

      await getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('testUserId');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 if profile retrieval fails', async () => {
      const req = mockRequest({}, {}, {}, { id: 'testUserId' });
      const res = mockResponse();

      User.findById.mockRejectedValueOnce(new Error('Profile error'));

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Profile error');
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile', async () => {
      const req = mockRequest({ username: 'updateduser' }, {}, {}, { id: 'testUserId' });
      const res = mockResponse();

      const updatedUser = { _id: 'testUserId', username: 'updateduser', email: 'test@example.com' };
      User.findByIdAndUpdate.mockResolvedValueOnce(updatedUser);

      await updateProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('testUserId', req.body, { new: true });
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 400 if profile update fails', async () => {
      const req = mockRequest({ username: 'updateduser' }, {}, {}, { id: 'testUserId' });
      const res = mockResponse();

      User.findByIdAndUpdate.mockRejectedValueOnce(new Error('Update error'));

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Update error');
    });
  });

  describe('deleteProfile', () => {
    it('should delete the user profile', async () => {
      const req = mockRequest({}, {}, {}, { id: 'testUserId' });
      const res = mockResponse();

      User.findByIdAndDelete.mockResolvedValueOnce();

      await deleteProfile(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('testUserId');
      expect(res.send).toHaveBeenCalledWith('User deleted successfully');
    });

    it('should return 400 if profile deletion fails', async () => {
      const req = mockRequest({}, {}, {}, { id: 'testUserId' });
      const res = mockResponse();

      User.findByIdAndDelete.mockRejectedValueOnce(new Error('Deletion error'));

      await deleteProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Deletion error');
    });
  });
});
