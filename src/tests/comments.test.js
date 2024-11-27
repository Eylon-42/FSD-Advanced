const Comment = require('../models/commentModel');
const {
  createComment,
  getAllComments,
  getCommentsByPost,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

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

// Mock Comment model
jest.mock('../models/commentModel');

describe('Comment Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const req = mockRequest({ text: 'Test comment', postId: '1', userId: 'user1' });
      const res = mockResponse();

      const mockComment = { id: '1', text: 'Test comment', postId: '1', userId: 'user1' };
      Comment.create.mockResolvedValueOnce(mockComment);

      await createComment(req, res);

      expect(Comment.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockComment);
    });

    it('should return 400 if comment creation fails', async () => {
      const req = mockRequest({ text: 'Test comment', postId: '1', userId: 'user1' });
      const res = mockResponse();

      Comment.create.mockRejectedValueOnce(new Error('Creation error'));

      await createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Creation error' });
    });
  });

  describe('getAllComments', () => {
    it('should retrieve all comments successfully', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockComments = [
        { id: '1', text: 'Comment 1', postId: '1', userId: 'user1' },
        { id: '2', text: 'Comment 2', postId: '2', userId: 'user2' },
      ];
      Comment.find.mockResolvedValueOnce(mockComments);

      await getAllComments(req, res);

      expect(Comment.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockComments);
    });

    it('should return 500 if fetching all comments fails', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Comment.find.mockRejectedValueOnce(new Error('Fetch error'));

      await getAllComments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fetch error' });
    });
  });

  describe('getCommentsByPost', () => {
    it('should retrieve comments for a specific post successfully', async () => {
      const req = mockRequest({}, { postId: '1' });
      const res = mockResponse();

      const mockComments = [
        { id: '1', text: 'Comment 1', postId: '1', userId: 'user1' },
      ];
      Comment.find.mockResolvedValueOnce(mockComments);

      await getCommentsByPost(req, res);

      expect(Comment.find).toHaveBeenCalledWith({ postId: '1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockComments);
    });

    it('should return 500 if fetching comments for a post fails', async () => {
      const req = mockRequest({}, { postId: '1' });
      const res = mockResponse();

      Comment.find.mockRejectedValueOnce(new Error('Fetch error'));

      await getCommentsByPost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fetch error' });
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const req = mockRequest({ text: 'Updated comment' }, { id: '1' });
      const res = mockResponse();

      const updatedComment = { id: '1', text: 'Updated comment', postId: '1', userId: 'user1' };
      Comment.findByIdAndUpdate.mockResolvedValueOnce(updatedComment);

      await updateComment(req, res);

      expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, { new: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedComment);
    });

    it('should return 404 if the comment to update is not found', async () => {
      const req = mockRequest({ text: 'Updated comment' }, { id: '1' });
      const res = mockResponse();

      Comment.findByIdAndUpdate.mockResolvedValueOnce(null);

      await updateComment(req, res);

      expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, { new: true });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Comment not found' });
    });

    it('should return 400 if updating the comment fails', async () => {
      const req = mockRequest({ text: 'Updated comment' }, { id: '1' });
      const res = mockResponse();

      Comment.findByIdAndUpdate.mockRejectedValueOnce(new Error('Update error'));

      await updateComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      Comment.findByIdAndDelete.mockResolvedValueOnce({ id: '1', text: 'Deleted comment' });

      await deleteComment(req, res);

      expect(Comment.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if the comment to delete is not found', async () => {
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      Comment.findByIdAndDelete.mockResolvedValueOnce(null);

      await deleteComment(req, res);

      expect(Comment.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Comment not found' });
    });

    it('should return 500 if deleting the comment fails', async () => {
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      Comment.findByIdAndDelete.mockRejectedValueOnce(new Error('Delete error'));

      await deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
    });
  });
});
