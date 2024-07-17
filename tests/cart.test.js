const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const userFactory = require("./factories/user.factory");
const productFactory = require("./factories/product.factory");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);

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

  let response = await request(app).post("/users/signup").send(user);

  let loginData = {
    email: "baboulinet@test.com",
    password: "imbaboulinet",
  };

  response = await request(app).post("/users/login").send(loginData);

  userId = response.body.userId;
  userToken = response.body.token;

  // Admin

  user = userFactory({
    email: "barryallen@flash.com",
    password: "iamtheflash",
    username: "Flash",
    isAdmin: true,
  });

  response = await request(app).post("/users/signup").send(user);

  loginData = {
    email: "barryallen@flash.com",
    password: "iamtheflash",
  };

  response = await request(app).post("/users/login").send(loginData);

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

  it("When checking out, then the paymentIntent.client_secret is returned", async () => {
    const productData1 = productFactory({ name: "Product 1", price: 100 });
    const productData2 = productFactory({ name: "Product 2", price: 40 });

    let product1;
    let product2;

    let orders;
    let clientSecret;

    let response = await request(app)
      .post("/products")
      .set("Authorization", `Basic ${adminToken}`)
      .send(productData1);
    product1 = response.body.product;

    response = await request(app)
      .post("/products")
      .set("Authorization", `Basic ${adminToken}`)
      .send(productData2);
    product2 = response.body.product;

    response = await request(app)
      .post("/cart/add")
      .set("Authorization", `Basic ${userToken}`)
      .send({ userId, productId: product1._id, quantity: 1 });

    response = await request(app)
      .post("/cart/add")
      .set("Authorization", `Basic ${userToken}`)
      .send({ userId, productId: product2._id, quantity: 2 });
    cart = response.body;

    response = await request(app)
      .post("/cart/checkout")
      .set("Authorization", `Basic ${userToken}`)
      .send({ userId });
    cart = response.body.cart;
    clientSecret = response.body.client_secret;

    response = await request(app)
      .get(`/users/${userId}/orders`)
      .set("Authorization", `Basic ${userToken}`);
    orders = response.body;

    expect(cart.items.length).toEqual(2);
    expect(cart.paymentIntentId).toBeDefined();

    expect(orders).toHaveProperty("length");
    expect(orders.length).toEqual(1);
    expect(orders[0].status).toMatch("Pending");

    expect(clientSecret).toBeDefined();
  });
});
