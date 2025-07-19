const Products = require("../data/products");

const resolvers = {
  Query: {
    products: () => Products,
    product: (_, { id }) => Products.find((item) => item.id === id),
  },
  Mutation: {
    createProduct: (_, { title, category, price, inStock }) => {
      const newlyCreatedProduct = {
        id: String(Products.length + 1),
        title,
        category,
        price,
        inStock,
      };
      Products.push(newlyCreatedProduct);
      return newlyCreatedProduct;
    },
    deleteProduct: (_, { id }) => {
      const index = Products.findIndex((item) => item.id === id);

      if (index === -1) return false;
      Products.splice(index, 1);
      return true;
    },
    updateProduct: (_, { id, ...updatedItems }) => {
      const index = Products.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const updatedProductItem = {
        ...Products[index],
        ...updatedItems,
      };
      Products[index] = updatedProductItem;

      return updatedProductItem;
    },
  },
};

module.exports = resolvers;
