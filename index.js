const app = require("./app");

const db = require("./src/config/mongo");
db();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
