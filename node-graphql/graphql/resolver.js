const Product = require("../models/productModel");

const resolvers = {
  Query: {
    products: async () => await Product.find({}),
    product: async (_, { id }) => await Product.findById(id),
  },
  Mutation: {
    createProduct: async (_, args) => {
      const newlyCreatedProduct = new Product(args);
      return await newlyCreatedProduct.save();
    },
    deleteProduct: async (_, { id }) => {
      const product = await Product.findByIdAndDelete(id);
      return !!product;
    },
    updateProduct: async (_, { id, ...updatedItems }) => {
      return await Product.findByIdAndUpdate(id, updatedItems, { new: true });
    },
  },
};

module.exports = resolvers;
