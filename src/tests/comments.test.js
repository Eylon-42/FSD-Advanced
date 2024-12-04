const request = require("supertest");
const connectDB = require("../../server");
const mongoose = require("mongoose");
const CommentSchema = require("../models/commentModel");
const PostSchema = require("../models/postModel")

const { testComments, failureComment, testPost } = require("./testData/testComments");

let app;
beforeAll(async () => {
  app = await connectDB();
  await CommentSchema.deleteMany();
  await PostSchema.deleteMany()
  await request(app).post("/posts").send(testPost);
});

afterAll(() => {
  mongoose.connection.close();
});

describe("Comments Test", () => {
  test("Test get all comments empty", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test should create comments successfully", async () => {
    const posts = await request(app).get("/posts");
    const post_id = posts.body[0]._id;
    for (let comment of testComments) {
      const response = await request(app).post("/comments").send({postId: post_id , ...comment});
      expect(response.statusCode).toBe(201);
      expect(response.body.postId).toBe(post_id);
      expect(response.body.content).toBe(comment.content);
      expect(response.body.sender).toBe(comment.sender);
      comment._id = response.body._id;
    }
  });

  test('Test should return 400 if comment creation fails', async () => {
    const response = await request(app).post("/comments").send(failureComment)
    expect(response.statusCode).toBe(400)
  })

  test("Test should retrieve all comments successfully", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testComments.length);
  });

  test("Test should retrieve a comment by PostID successfully", async () => {
    const posts = await request(app).get("/posts/");
    const post_id = posts.body[0]._id;
    const response = await request(app).get("/comments?postId=" + post_id)
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testComments.length);
  });

  test("Test Delete Comment", async () => {
    const response = await request(app).delete("/comments/" + testComments[0]._id);
    expect(response.statusCode).toBe(204);
    
    const responseGet = await request(app).get("/comments/" + testComments[0]._id);
    expect(responseGet.statusCode).toBe(404);
  });

});