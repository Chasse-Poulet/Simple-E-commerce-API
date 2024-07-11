module.exports = (overrides = {}) => {
  const defaultUser = {
    username: "sampleuser",
    email: "user@example.com",
    password: "password123",
  };

  return { ...defaultUser, ...overrides };
};
