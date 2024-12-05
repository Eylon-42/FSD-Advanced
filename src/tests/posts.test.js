const request = require("supertest");
const connectDB = require("../../server");
const mongoose = require("mongoose");
const PostSchema = require("../models/postModel");
const { createUserToken } = require("./testUtils")

const { testPosts, failurePost } = require("./testData/testPosts");

const userCred = {
  username: "Adir",
  email: "adir@mail.com",
  password: "1234"
}

let token;
let app;
beforeAll(async () => {
  app = await connectDB();
  token = await createUserToken(app, userCred)
  await PostSchema.deleteMany();
});

afterAll(() => {
  mongoose.connection.close();
});

describe("Posts Test", () => {
  test("Test get all post empty", async () => {
    const response = await request(app).get("/posts").set("Authorization", token);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test should create a post successfully", async () => {
    for (let post of testPosts) {
      const response = await request(app).post("/posts").set("Authorization", token).send(post);
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(post.title);
      expect(response.body.content).toBe(post.content);
      expect(response.body.sender).toBe(userCred.username);
      post._id = response.body._id;
    }
  });

  test('Test should return 400 if post creation fails', async () => {
    const response = await request(app).post("/posts").set("Authorization", token).send(failurePost)
    expect(response.statusCode).toBe(400)
  })

  test("Test should retrieve all posts successfully", async () => {
    const response = await request(app).get("/posts").set("Authorization", token);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testPosts.length);
  });

  test("Test should retrieve a post by ID successfully", async () => {
    const response = await request(app).get("/posts/" + testPosts[0]._id).set("Authorization", token);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(testPosts[0]._id);
  });

  test("Test filter post by sender", async () => {
    const response = await request(app).get(
      "/posts?sender=" + userCred.username
    ).set("Authorization", token);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test Delete post", async () => {
    const response = await request(app).delete("/posts/" + testPosts[0]._id).set("Authorization", token);
    expect(response.statusCode).toBe(200);

    const responseGet = await request(app).get("/posts/" + testPosts[0]._id).set("Authorization", token);
    expect(responseGet.statusCode).toBe(404);
  });
});