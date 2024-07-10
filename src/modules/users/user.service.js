const User = require("./user.model");

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getUserById = async (id) => {
  return await User.findById(id);
};

exports.getUserByEmail = async (email) => {
  return User.findOne({ email });
};

exports.signup = async (userData) => {
  const user = new User(userData);
  return user.save();
};

exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
