const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const userFactory = require("./factories/user.factory");

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
  const nonexistingid = "000000000000000000000000";

  let user;
  let admin;

  let userId;
  let usertoken;

  let adminId;
  let adminToken;

  describe("User signup", () => {
    it("When the data is malformed, then the statusCode is 400", async () => {
      const userData = userFactory({ email: { malformed: true } });

      const response = await request(app).post("/users/signup").send(userData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("When everything is ok, then it creates a new user", async () => {
      user = userFactory({
        email: "baboulinet@test.com",
        password: "imbaboulinet",
        username: "baboulinet",
      });

      const response = await request(app).post("/users/signup").send(user);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        message: "User added successfully.",
      });
    });

    it("When everything is ok, then it creates a new admin", async () => {
      admin = userFactory({
        email: "barryallen@flash.com",
        password: "iamtheflash",
        username: "Flash",
        isAdmin: true,
      });

      const response = await request(app).post("/users/signup").send(admin);

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

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ error: "User not found !" });
    });

    it("When the password is invalid, then the statusCode is 401", async () => {
      const loginData = {
        email: user.email,
        password: "invalidpassword",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ error: "Incorrect password !" });
    });

    it("When a normal user logs in, then the statusCode is 200 and the token is returned", async () => {
      const loginData = {
        email: user.email,
        password: user.password,
      };

      const response = await request(app).post("/users/login").send(loginData);
      userId = response.body.userId;
      usertoken = response.body.token;

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("When an admin logs in, then the statusCode is 200 and the admin token is returned", async () => {
      const loginData = {
        email: admin.email,
        password: admin.password,
      };

      const response = await request(app).post("/users/login").send(loginData);
      adminId = response.body.userId;
      adminToken = response.body.token;

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
  });

  describe("Get all users", () => {
    it("When a non admin user calls it, then return statusCode 403", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Basic ${usertoken}`);

      expect(response.statusCode).toBe(403);
    });

    it("When the admin calls it, then return statusCode 200 and an array", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("length");
    });
  });

  describe("Get user by id", () => {
    it("When an unanthenticated user requests someone's infos, then the statusCode is 401", async () => {
      const response = await request(app).get(`/users/${userId}`);

      expect(response.statusCode).toBe(401);
    });

    it("When a normal user requests another user's infos, then the statusCode is 403", async () => {
      const response = await request(app)
        .get(`/users/${adminId}`)
        .set("Authorization", `Basic ${usertoken}`);

      expect(response.statusCode).toBe(403);
    });

    it("When a user requests their infos, then the statusCode is 200 and the right user is returned", async () => {
      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Basic ${usertoken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(userId);
    });

    it("When an admin requests a non existing user's infos, then the statusCode is 404", async () => {
      const response = await request(app)
        .get(`/users/${nonexistingid}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });

    it("When an admin requests their infos, then the statusCode is 200 and the admin is returned", async () => {
      const response = await request(app)
        .get(`/users/${adminId}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(adminId);
    });

    it("When an admin requests another user's infos, then the statusCode is 200 and the right user is returned", async () => {
      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(userId);
    });
  });

  describe("Delete user by id", () => {
    it("When an admin deletes a non existing user, then the statusCode is 404", async () => {
      const response = await request(app)
        .delete(`/users/${nonexistingid}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });

    it("When everything is ok, then the statusCode is 200 and the deleted user is returned", async () => {
      const response = await request(app)
        .delete(`/users/${userId}`)
        .set("Authorization", `Basic ${usertoken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(userId);
    });

    it("When everything is ok, then the statusCode is 200 and the deleted admin is returned", async () => {
      const response = await request(app)
        .delete(`/users/${adminId}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(adminId);
    });
  });
});
