const request = require("supertest");

const createUserToken = async (app, userCred) =>{
    await request(app).post("/api/users/register").send(userCred);
    const loginResponse = await request(app).post("/api/users/login").send({email: userCred.email, password: userCred.password})
    return {token: loginResponse.body.token, refreshToken: loginResponse.body.refresh_token };
  }

  module.exports = {createUserToken}