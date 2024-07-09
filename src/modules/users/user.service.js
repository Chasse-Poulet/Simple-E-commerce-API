const User = require("./user.model");

async function getAllUsers() {
  return await User.find();
}

async function getUserById(id) {
  return await User.findById(id);
}

async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function signup(userData) {
  const user = new User(userData);
  return user.save();
}

async function deleteUser(id) {
  return await User.findByIdAndDelete(id);
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  signup,
  deleteUser,
};
