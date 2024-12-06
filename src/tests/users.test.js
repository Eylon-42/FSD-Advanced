const request = require("supertest");
const connectDB = require("../../server");
const mongoose = require("mongoose");
const userSchema = require("../models/userModel");
const { clearTokens } = require("../store/tokenStore");
const { testUsers, failureUser } = require("./testData/testUsers");

let app;

beforeAll(async () => {
  app = await connectDB();
  await userSchema.deleteMany();
  clearTokens();
});

afterAll(() => {
  mongoose.connection.close();
});

describe("Users Test", () => {
  let accessToken;
  let refreshToken;

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

    // Store tokens for later use
    accessToken = response.body.token;
    refreshToken = response.body.refresh_token;

    // Ensure tokens are returned
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
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
    const response = await request(app)
      .get("/api/users/profile")
      .set("authorization", `${accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(testUsers[0].email);
  });

  test("Test should update profile successfully", async () => {
    const updates = { username: "UpdatedUser" };
    const response = await request(app)
      .put("/api/users/profile")
      .set("authorization", accessToken)
      .send(updates);
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe("UpdatedUser");
  });

  test("Test should refresh access token successfully", async () => {
    // Simulate access token expiration by invalidating it
    accessToken = "invalid.token.here";

    const response = await request(app)
      .post("/api/users/refresh-token")
      .send({ refresh_token: refreshToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();

    // Update the accessToken with the new token
    accessToken = response.body.token;

    // Use the new access token to access a protected route
    const profileResponse = await request(app)
      .get("/api/users/profile")
      .set("authorization", `${accessToken}`);
    expect(profileResponse.statusCode).toBe(200);
    expect(profileResponse.body.email).toBe(testUsers[0].email);
  });

  test("Test should fail to refresh token with invalid refresh token", async () => {
    const invalidRefreshToken = "invalid.refresh.token";

    const response = await request(app)
      .post("/api/users/refresh-token")
      .send({ refresh_token: invalidRefreshToken });
    expect(response.statusCode).toBe(403);
    expect(response.text).toBe("Invalid refresh token");
  });

  test("Test should logout successfully and invalidate refresh token", async () => {
    const response = await request(app)
      .post("/api/users/logout")
      .set("authorization", `${accessToken}`)
      .send({ refresh_token: refreshToken });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Logged out successfully");

    // Attempt to refresh token after logout
    const refreshResponse = await request(app)
      .post("/api/users/refresh-token")
      .send({ refresh_token: refreshToken });
    expect(refreshResponse.statusCode).toBe(403);
    expect(refreshResponse.text).toBe("Invalid refresh token");
  });

  test("Test should fail to access protected route with invalidated access token", async () => {
    const response = await request(app)
      .get("/api/users/profile")
      .set("authorization", `${accessToken}`);
    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("Token is invalidated");
  });

  test("Test should log in again and obtain new tokens", async () => {
    const loginData = {
      email: testUsers[0].email,
      password: testUsers[0].password,
    };
    const response = await request(app).post("/api/users/login").send(loginData);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Logged in successfully");

    // Store new tokens
    accessToken = response.body.token;
    refreshToken = response.body.refresh_token;

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  test("Test should delete profile successfully", async () => {
    clearTokens()
    // Log in to obtain fresh tokens
    const loginData = {
      email: testUsers[0].email,
      password: testUsers[0].password,
    };
    const loginResponse = await request(app).post("/api/users/login").send(loginData);
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.message).toBe("Logged in successfully");
  
    // Store new tokens
    const accessToken = loginResponse.body.token;
    const refreshToken = loginResponse.body.refresh_token;
  
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    
    // Proceed to delete profile
    const response = await request(app)
      .delete("/api/users/profile")
      .set("authorization", accessToken)
      .send({ refresh_token: refreshToken });
    
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("User deleted successfully");  
  
  });

  test("Test should fail creating a user with missing fields", async () => {
    const response = await request(app).post("/api/users/register").send(failureUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/validation failed/i);
  });
});