module.exports = (overrides = {}) => {
  const defaultProduct = {
    name: "Sample Product",
    price: 100,
  };

  return { ...defaultProduct, ...overrides };
};
