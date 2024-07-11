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
  const nonexistingid = "000000000000000000000000";

  let userId;
  let token;

  let adminUserId;
  let adminToken;

  describe("User signup", () => {
    it("When the data is malformed, then the statusCode is 400", async () => {
      const userData = {
        email: { malformed: "yes" },
        password: "a",
        username: "a",
      };

      const response = await request(app).post("/auth/signup").send(userData);

      expect(response.statusCode).toBe(400);
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

    it("When everything is ok, then it creates a new admin", async () => {
      const userData = {
        email: "barryallen@flash.com",
        password: "iamtheflash",
        username: "Flash",
        isAdmin: true,
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

    it("When a normal user logs in, then the statusCode is 200 and the token is returned", async () => {
      const loginData = {
        email: "baboulinet@test.com",
        password: "imbaboulinet",
      };

      const response = await request(app).post("/auth/login").send(loginData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");

      userId = response.body.userId;
      token = response.body.token;
    });

    it("When an admin logs in, then the statusCode is 200 and the admin token is returned", async () => {
      const loginData = {
        email: "barryallen@flash.com",
        password: "iamtheflash",
      };

      const response = await request(app).post("/auth/login").send(loginData);
      adminUserId = response.body.userId;
      adminToken = response.body.token;

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
  });

  describe("Get all users", () => {
    it("When a non admin user calls it, then return statusCode 403", async () => {
      const response = await request(app)
        .get("/auth")
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(403);
    });

    it("When the admin calls it, then return statusCode 200 and an array", async () => {
      const response = await request(app)
        .get("/auth")
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("length");
    });
  });

  describe("Get user by id", () => {
    it("When an unanthenticated user requests someone's infos, then the statusCode is 401", async () => {
      const response = await request(app).get(`/auth/${userId}`);

      expect(response.statusCode).toBe(401);
    });

    it("When a normal user requests another user's infos, then the statusCode is 403", async () => {
      const response = await request(app)
        .get(`/auth/${adminUserId}`)
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(403);
    });

    it("When a user requests their infos, then the statusCode is 200 and the right user is returned", async () => {
      const response = await request(app)
        .get(`/auth/${userId}`)
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(userId);
    });

    it("When an admin requests a non existing user's infos, then the statusCode is 404", async () => {
      const response = await request(app)
        .get(`/auth/${nonexistingid}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });

    it("When an admin requests their infos, then the statusCode is 200 and the admin is returned", async () => {
      const response = await request(app)
        .get(`/auth/${adminUserId}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(adminUserId);
    });

    it("When an admin requests another user's infos, then the statusCode is 200 and the right user is returned", async () => {
      const response = await request(app)
        .get(`/auth/${userId}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(userId);
    });
  });

  describe("Delete user by id", () => {
    it("When an admin deletes a non existing user, then the statusCode is 404", async () => {
      const response = await request(app)
        .delete(`/auth/${nonexistingid}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });

    it("When everything is ok, then the statusCode is 200 and the deleted user is returned", async () => {
      const response = await request(app)
        .delete(`/auth/${userId}`)
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(userId);
    });

    it("When everything is ok, then the statusCode is 200 and the deleted admin is returned", async () => {
      const response = await request(app)
        .delete(`/auth/${adminUserId}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toMatch(adminUserId);
    });
  });
});
