const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const userFactory = require("./factories/user.factory");
const productFactory = require("./factories/product.factory");

let mongoServer;

let userId;
let userToken;

let adminId;
let adminToken;

let product;

let cart;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {});

  // Normal user

  let user = userFactory({
    email: "baboulinet@test.com",
    password: "imbaboulinet",
    username: "baboulinet",
  });

  let response = await request(app).post("/auth/signup").send(user);

  let loginData = {
    email: "baboulinet@test.com",
    password: "imbaboulinet",
  };

  response = await request(app).post("/auth/login").send(loginData);

  userId = response.body.userId;
  userToken = response.body.token;

  // Admin

  user = userFactory({
    email: "barryallen@flash.com",
    password: "iamtheflash",
    username: "Flash",
    isAdmin: true,
  });

  response = await request(app).post("/auth/signup").send(user);

  loginData = {
    email: "barryallen@flash.com",
    password: "iamtheflash",
  };

  response = await request(app).post("/auth/login").send(loginData);

  adminId = response.body.userId;
  adminToken = response.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Cart API", () => {
  it("should add a product to the shopping cart", async () => {
    const productData = productFactory();

    const productResponse = await request(app)
      .post("/products")
      .set("Authorization", `Basic ${adminToken}`)
      .send(productData);

    product = productResponse.body.product;

    const response = await request(app)
      .post("/cart/add")
      .set("Authorization", `Basic ${userToken}`)
      .send({
        userId,
        productId: product._id,
        quantity: 2,
      });

    cart = response.body;

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items[0].quantity).toBe(2);
  });

  it("should remove a product from the shopping cart", async () => {
    const response = await request(app)
      .post("/cart/remove")
      .set("Authorization", `Basic ${userToken}`)
      .send({ userId, productId: product._id });

    expect(response.statusCode).toBe(200);
    expect(response.body.items.length).toBe(0);
  });
});
