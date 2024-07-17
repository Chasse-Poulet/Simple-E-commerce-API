# Simple-E-commerce-API

This is a very simple e-commerce API made with Node.js.

It is meant to be used only in a testing environment.

For that purpose it uses Stripe as the only payment gateway.

## Installation

Clone this repository then run :

```sh
npm install
```

### Environement variables

```sh
MONGO_URI="your mongodb uri"
TOKEN_SECRET="your secret used to hash passwords - it should be very long"
STRIPE_SECRET_KEY_TEST="your stripe test api key"
STRIPE_ENDPOINT_SECRET="your stripe endpoint secret"
```

## Run the app

To start the server run :

```sh
npm start
```

To run tests run :

```sh
npm test
```

## API Endpoints

### Users

| Route            | Request | Permission    | Description                                       |
| ---------------- | ------- | ------------- | ------------------------------------------------- |
| `/users`         | GET     | admin         | returns the list of all users                     |
| `/users/signup`  | POST    | \*            | creates a new user                                |
| `/users/login`   | POST    | \*            | logs the user in, returns the user's id and token |
| `/users/:userId` | GET     | self or admin | returns all the infos about an user               |
| `/users/:userId` | DELETE  | self or admin | deletes an user                                   |

### Products

| Route                  | Request | Permission | Description                                    |
| ---------------------- | ------- | ---------- | ---------------------------------------------- |
| `/products`            | GET     | \*         | returns the list of all products               |
| `/products`            | POST    | admin      | creates a new product                          |
| `/products/:productId` | GET     | \*         | returns all the infos about a product          |
| `/products/:productId` | PUT     | admin      | updates a product, returns the updated product |
| `/products/:productId` | DELETE  | admin      | deletes a product                              |

### Cart

| Route            | Request | Permission     | Description                                                  |
| ---------------- | ------- | -------------- | ------------------------------------------------------------ |
| `/cart/:userId`  | GET     | logged-in user | returns the cart of `userId`                                 |
| `/cart/add`      | POST    | logged-in user | adds a product to the cart                                   |
| `/cart/remove`   | POST    | logged-in user | removes a product from the cart                              |
| `/cart/checkout` | POST    | logged-in user | creates a Stripe payment intent then creates a pending order |

### Orders

| Route                   | Request | Permission    | Description                    |
| ----------------------- | ------- | ------------- | ------------------------------ |
| `/users/:userId/orders` | POST    | self or admin | returns all orders of `userId` |

### Stripe webhook

| Route             | Request | Permission | Description                                                                                                                                     |
| ----------------- | ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `/webhook/stripe` | POST    | stripe     | called by Stripe when a registered event happens (in this case `payment_intent.succeeded`) to complete an order, changing its status to "Paid". |

## License

[ISC](https://choosealicense.com/licenses/isc/)
