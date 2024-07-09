const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User API", () => {
  let userId;
  let token;

  describe("User signup", () => {
    it("When the data is malformed, then the statusCode is 500", async () => {
      const userData = {
        email: { malformed: "yes" },
        password: "a",
        username: "a",
      };

      const response = await request(app).post("/auth/signup").send(userData);

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("When everything is ok, then it creates a new user", async () => {
      const userData = {
        email: "baboulinet@test.com",
        password: "imbaboulinet",
        username: "baboulinet",
      };

      const response = await request(app).post("/auth/signup").send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        message: "User added successfully.",
      });
    });
  });

  describe("User login", () => {
    it("When the user does not exist, then the statusCode is 401", async () => {
      const loginData = {
        email: "bruce.wayne@batman.com",
        password: "imbatman",
      };

      const response = await request(app).post("/auth/login").send(loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ error: "User not found !" });
    });

    it("When the password is invalid, then the statusCode is 401", async () => {
      const loginData = {
        email: "baboulinet@test.com",
        password: "shitpissfuckcuntcocksuckermotherfuckertitsfartturdandtwat",
      };

      const response = await request(app).post("/auth/login").send(loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ error: "Incorrect password !" });
    });

    it("When everything is ok, then the statusCode is 200 and the token is returned", async () => {
      const loginData = {
        email: "baboulinet@test.com",
        password: "imbaboulinet",
      };

      const response = await request(app).post("/auth/login").send(loginData);
      userId = response.body.userId;
      token = response.body.token;

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
  });

  describe("Get all users", () => {
    it("should have a total of 1 user", async () => {
      const response = await request(app).get("/auth");

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toEqual(1);
    });
  });

  describe("Get user by id", () => {
    it("When everything is ok, then the statusCode is 200 and the right user is returned", async () => {
      const response = await request(app)
        .get(`/auth/${userId}`)
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(userId);
    });
  });

  describe("Delete user by id", () => {
    it("When everything is ok, then the statusCode is 200 and the deleted user is returned", async () => {
      const response = await request(app)
        .delete(`/auth/${userId}`)
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(userId);
    });
  });
});
