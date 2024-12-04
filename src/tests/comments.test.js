const request = require("supertest");
const connectDB = require("../../server");
const mongoose = require("mongoose");
const CommentSchema = require("../models/commentModel");
const PostSchema = require("../models/postModel")

const { testComments, failureComment, testPost, postUserCred, commentUserCred } = require("./testData/testComments");

const createUserToken = async (app, userCred) =>{
  await request(app).post("/api/users/register").send(userCred);
  const loginResponse = await request(app).post("/api/users/login").send({email: userCred.email, password: userCred.password})
  return loginResponse.body.token;
}
let commentToken;
let app;
beforeAll(async () => {
  app = await connectDB();
  commentToken = await createUserToken(app, commentUserCred);
  const postToken = await createUserToken(app, postUserCred);
  await CommentSchema.deleteMany();
  await PostSchema.deleteMany();
  await request(app).post("/posts").set("Authorization", postToken).send(testPost);
});

afterAll(() => {
  mongoose.connection.close();
});

describe("Comments Test", () => {
  test("Test get all comments empty", async () => {
    const response = await request(app).get("/comments").set("Authorization", commentToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test should create comments successfully", async () => {
    const posts = await request(app).get("/posts").set("Authorization", commentToken);
    const post_id = posts.body[0]._id;
    for (let comment of testComments) {
      const response = await request(app).post("/comments").set("Authorization", commentToken).send({postId: post_id , ...comment});
      expect(response.statusCode).toBe(201);
      expect(response.body.postId).toBe(post_id);
      expect(response.body.content).toBe(comment.content);
      expect(response.body.sender).toBe(comment.sender);
      comment._id = response.body._id;
    }
  });

  test('Test should return 400 if comment creation fails', async () => {
    const response = await request(app).post("/comments").set("Authorization", commentToken).send(failureComment)
    expect(response.statusCode).toBe(400)
  })

  test("Test should retrieve all comments successfully", async () => {
    const response = await request(app).get("/comments").set("Authorization", commentToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testComments.length);
  });

  test("Test should retrieve a comment by PostID successfully", async () => {
    const posts = await request(app).get("/posts/").set("Authorization", commentToken);
    const post_id = posts.body[0]._id;
    const response = await request(app).get("/comments?postId=" + post_id).set("Authorization", commentToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testComments.length);
  });

  test("Test Delete Comment", async () => {
    const response = await request(app).delete("/comments/" + testComments[0]._id).set("Authorization", commentToken);
    expect(response.statusCode).toBe(204);
    
    const responseGet = await request(app).get("/comments/" + testComments[0]._id).set("Authorization", commentToken);
    expect(responseGet.statusCode).toBe(404);
  });

});