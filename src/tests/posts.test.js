const Post = require('../models/postModel');
const { createPost, getAllPosts, getPostById, getPostsBySender, updatePost } = require('../controllers/postController');

// Mocking Express response and request
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
};

const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
});

// Mock Post model
jest.mock('../models/postModel');

describe('Post Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const req = mockRequest({ title: 'Test Post', content: 'Test Content', sender: 'User1' });
      const res = mockResponse();

      const mockPost = { id: '1', title: 'Test Post', content: 'Test Content', sender: 'User1' };
      Post.create.mockResolvedValueOnce(mockPost);

      await createPost(req, res);

      expect(Post.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 400 if post creation fails', async () => {
      const req = mockRequest({ title: 'Test Post', content: 'Test Content', sender: 'User1' });
      const res = mockResponse();

      Post.create.mockRejectedValueOnce(new Error('Creation error'));

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Creation error' });
    });
  });

  describe('getAllPosts', () => {
    it('should retrieve all posts successfully', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockPosts = [
        { id: '1', title: 'Post 1', content: 'Content 1' },
        { id: '2', title: 'Post 2', content: 'Content 2' },
      ];
      Post.find.mockResolvedValueOnce(mockPosts);

      await getAllPosts(req, res);

      expect(Post.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should return 500 if fetching posts fails', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Post.find.mockRejectedValueOnce(new Error('Fetch error'));

      await getAllPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fetch error' });
    });
  });

  describe('getPostById', () => {
    it('should retrieve a post by ID successfully', async () => {
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      const mockPost = { id: '1', title: 'Test Post', content: 'Test Content' };
      Post.findById.mockResolvedValueOnce(mockPost);

      await getPostById(req, res);

      expect(Post.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 404 if post is not found', async () => {
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      Post.findById.mockResolvedValueOnce(null);

      await getPostById(req, res);

      expect(Post.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should return 500 if fetching post by ID fails', async () => {
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      Post.findById.mockRejectedValueOnce(new Error('Fetch error'));

      await getPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fetch error' });
    });
  });

  describe('getPostsBySender', () => {
    it('should retrieve posts by sender successfully', async () => {
      const req = mockRequest({}, {}, { sender: 'User1' });
      const res = mockResponse();

      const mockPosts = [
        { id: '1', title: 'Post 1', content: 'Content 1', sender: 'User1' },
      ];
      Post.find.mockResolvedValueOnce(mockPosts);

      await getPostsBySender(req, res);

      expect(Post.find).toHaveBeenCalledWith({ sender: 'User1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should return 500 if fetching posts by sender fails', async () => {
      const req = mockRequest({}, {}, { sender: 'User1' });
      const res = mockResponse();

      Post.find.mockRejectedValueOnce(new Error('Fetch error'));

      await getPostsBySender(req, res);

      expect(Post.find).toHaveBeenCalledWith({ sender: 'User1' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fetch error' });
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const req = mockRequest({ title: 'Updated Post' }, { id: '1' });
      const res = mockResponse();

      const updatedPost = { id: '1', title: 'Updated Post', content: 'Updated Content' };
      Post.findByIdAndUpdate.mockResolvedValueOnce(updatedPost);

      await updatePost(req, res);

      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, { new: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedPost);
    });

    it('should return 404 if post to update is not found', async () => {
      const req = mockRequest({ title: 'Updated Post' }, { id: '1' });
      const res = mockResponse();

      Post.findByIdAndUpdate.mockResolvedValueOnce(null);

      await updatePost(req, res);

      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, { new: true });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should return 400 if update fails', async () => {
      const req = mockRequest({ title: 'Updated Post' }, { id: '1' });
      const res = mockResponse();

      Post.findByIdAndUpdate.mockRejectedValueOnce(new Error('Update error'));

      await updatePost(req, res);

      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, { new: true });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });
  });
});
