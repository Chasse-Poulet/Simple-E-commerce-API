const mongoose = require("mongoose");

const db = async () => {
  mongoose.connect(process.env.MONGO_URI);
};

module.exports = db;
