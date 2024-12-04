module.exports = {
    testUsers: [
      {
        username: "TestUser1",
        email: "testuser1@example.com",
        password: "password123",
      },
      {
        username: "TestUser2",
        email: "testuser2@example.com",
        password: "password123",
      },
    ],
    failureUser: {
      username: "IncompleteUser", // Missing email and password
    },
  };