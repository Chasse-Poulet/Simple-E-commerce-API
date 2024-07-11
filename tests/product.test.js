const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

let userId;
let token;

let adminUserId;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {});

  // Normal user

  let userData = {
    email: "baboulinet@test.com",
    password: "imbaboulinet",
    username: "baboulinet",
  };

  let response = await request(app).post("/auth/signup").send(userData);

  let loginData = {
    email: "baboulinet@test.com",
    password: "imbaboulinet",
  };

  response = await request(app).post("/auth/login").send(loginData);

  userId = response.body.userId;
  token = response.body.token;

  // Admin

  userData = {
    email: "barryallen@flash.com",
    password: "iamtheflash",
    username: "Flash",
    isAdmin: true,
  };

  response = await request(app).post("/auth/signup").send(userData);

  loginData = {
    email: "barryallen@flash.com",
    password: "iamtheflash",
  };

  response = await request(app).post("/auth/login").send(loginData);

  adminUserId = response.body.userId;
  adminToken = response.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Product API", () => {
  const nonexistingid = "000000000000000000000000";

  const malformedProductData = {
    name: "Awesome product",
    price: { malformed: true, value: 10 },
  };

  const productData = {
    name: "Awesome product",
    price: 10,
  };

  const malformedUpdateData = {
    name: "Awesome modified product",
    price: { malformed: true, value: 23, good: false },
  };

  const updateData = {
    name: "Awesome modified product",
    price: 23,
  };

  let product;

  describe("Create product", () => {
    it("When an unanthenticated user tries to create a product, then fails and returns statusCode 401", async () => {
      const response = await request(app).post("/products").send(productData);

      expect(response.statusCode).toBe(401);
    });

    it("When a non admin tries to create a product, then fails and returns statusCode 403", async () => {
      const response = await request(app)
        .post("/products")
        .set("Authorization", `Basic ${token}`)
        .send(productData);

      expect(response.statusCode).toBe(403);
    });

    it("When the data is malformed, then returns statusCode 400", async () => {
      const response = await request(app)
        .post("/products")
        .set("Authorization", `Basic ${adminToken}`)
        .send(malformedProductData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("When the product data is well formed, then returns statusCode 201 and the product", async () => {
      const response = await request(app)
        .post("/products")
        .set("Authorization", `Basic ${adminToken}`)
        .send(productData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("product");
      expect(response.body.product).toHaveProperty("_id");
      expect(response.body).toHaveProperty("message");

      product = response.body.product;
    });
  });

  describe("Get all products", () => {
    it("When an unanthenticated user requests all products, then returns statusCode 200 and the list of products", async () => {
      const response = await request(app).get("/products");

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("length");
    });

    it("When a normal user requests all products, then returns statusCode 200 and the list of products", async () => {
      const response = await request(app)
        .get("/products")
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("length");
    });

    it("When an admin requests all products, then returns statusCode 200 and the list of products", async () => {
      const response = await request(app)
        .get("/products")
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("length");
    });
  });

  describe("Get product by id", () => {
    it("When a normal user requests a non-existing product, then returns statusCode 404", async () => {
      const response = await request(app).get(`/products/${nonexistingid}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("When an unanthenticated user requests a product, then returns statusCode 200 and the product", async () => {
      const response = await request(app).get(`/products/${product._id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(product);
    });

    it("When a normal user requests a product, then returns statusCode 200 and the product", async () => {
      const response = await request(app)
        .get(`/products/${product._id}`)
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(product);
    });

    it("When an admin requests a product, then returns statusCode 200 and the product", async () => {
      const response = await request(app)
        .get(`/products/${product._id}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(product);
    });
  });

  describe("Update product", () => {
    it("When an unanthenticated user tries to update a product, then fails and returns statusCode 401", async () => {
      const response = await request(app)
        .put(`/products/${product._id}`)
        .send(updateData);

      expect(response.statusCode).toBe(401);
    });

    it("When a normal user tries to update a product, then fails and returns statusCode 403", async () => {
      const response = await request(app)
        .put(`/products/${product._id}`)
        .set("Authorization", `Basic ${token}`)
        .send(updateData);

      expect(response.statusCode).toBe(403);
    });

    it("When an admin tries to update a product with malformed data, then fails and returns statusCode 400", async () => {
      const response = await request(app)
        .put(`/products/${product._id}`)
        .set("Authorization", `Basic ${adminToken}`)
        .send(malformedUpdateData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("When an admin tries to update a non-existing product, then fails and returns statusCode 404", async () => {
      const response = await request(app)
        .put(`/products/${nonexistingid}`)
        .set("Authorization", `Basic ${adminToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("When an admin tries to update a product with well formed data, then returns statusCode 200 and the updated product", async () => {
      const response = await request(app)
        .put(`/products/${product._id}`)
        .set("Authorization", `Basic ${adminToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(updateData);

      product = response.body;
    });
  });

  describe("Delete product", () => {
    it("When an unanthenticated user tries to delete a product, then fails and returns statusCode 401", async () => {
      const response = await request(app).delete(`/products/${product._id}`);

      expect(response.statusCode).toBe(401);
    });

    it("When a normal user tries to delete a product, then fails and returns statusCode 403", async () => {
      const response = await request(app)
        .delete(`/products/${product._id}`)
        .set("Authorization", `Basic ${token}`);

      expect(response.statusCode).toBe(403);
    });

    it("When an admin tries to delete a non-existing product, then returns statusCode 404", async () => {
      const response = await request(app)
        .delete(`/products/${nonexistingid}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("When an admin tries to delete a product, then returns statusCode 200 and the deleted product", async () => {
      const response = await request(app)
        .delete(`/products/${product._id}`)
        .set("Authorization", `Basic ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.isDeleted).toBe(true);
    });
  });
});
