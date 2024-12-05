const request = require("supertest");
const connectDB = require("../../server");
const mongoose = require("mongoose");
const userSchema = require("../models/userModel");

const { testUsers, failureUser } = require("./testData/testUsers");

let app;

beforeAll(async () => {
  app = await connectDB();
  await userSchema.deleteMany();
});

afterAll(() => {
  mongoose.connection.close();
});

describe("Users Test", () => {
  test("Test get profile empty (unauthorized)", async () => {
    const response = await request(app).get("/api/users/profile");
    expect(response.statusCode).toBe(401);
  });

  test("Test should register a user successfully", async () => {
    for (let user of testUsers) {
      const response = await request(app).post("/api/users/register").send(user);
      expect(response.statusCode).toBe(201);
      expect(response.text).toBe("User registered successfully");
      user._id = response.body._id;
    }
  });

  test("Test should fail registration with duplicate email", async () => {
    const response = await request(app).post("/api/users/register").send(testUsers[0]);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/duplicate key error/i);
  });

  test("Test should log in successfully", async () => {
    const loginData = {
      email: testUsers[0].email,
      password: testUsers[0].password,
    };
    const response = await request(app).post("/api/users/login").send(loginData);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Logged in successfully");
  });

  test("Test should fail login with invalid credentials", async () => {
    const loginData = {
      email: "invalid@example.com",
      password: "wrongpassword",
    };
    const response = await request(app).post("/api/users/login").send(loginData);
    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("Invalid email or password");
  });

  test("Test should retrieve profile successfully (authenticated)", async () => {
    const loginData = {
      email: testUsers[0].email,
      password: testUsers[0].password,
    };
    const loginResponse = await request(app).post("/api/users/login").send(loginData);
    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(testUsers[0].email);
  });

  test("Test should update profile successfully", async () => {
    const loginData = {
      email: testUsers[0].email,
      password: testUsers[0].password,
    };
    const loginResponse = await request(app).post("/api/users/login").send(loginData);
    const token = loginResponse.body.token;

    const updates = { username: "UpdatedUser" };
    const response = await request(app)
      .put("/api/users/profile")
      .set("Authorization", token)
      .send(updates);
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe("UpdatedUser");
  });

  test("Test should delete profile successfully", async () => {
    const loginData = {
      email: testUsers[0].email,
      password: testUsers[0].password,
    };
    const loginResponse = await request(app).post("/api/users/login").send(loginData);
    const token = loginResponse.body.token;

    const response = await request(app)
      .delete("/api/users/profile")
      .set("Authorization", `${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("User deleted successfully");

    const profileResponse = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `${token}`);
    expect(profileResponse.statusCode).toBe(401);
  });

  test("Test should fail creating a user with missing fields", async () => {
    const response = await request(app).post("/api/users/register").send(failureUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/validation failed/i);
  });
});