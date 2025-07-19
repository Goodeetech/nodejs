const { gql } = require("graphql-tag");

const typeDefs = gql`
  type Product {
    id: ID!
    title: String!
    category: String!
    inStock: Boolean!
    price: Float!
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
  }
  type Mutation {
    createProduct(
      title: String!
      price: Float!
      category: String!
      inStock: Boolean!
    ): Product
    deleteProduct(id: ID!): Boolean
    updateProduct(
      id: ID!
      title: String
      price: Float
      category: String
      inStock: Boolean
    ): Product
  }
`;

module.exports = typeDefs;
