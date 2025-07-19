require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const resolvers = require("./graphql/resolver");
const typeDefs = require("./graphql/schema");
const connectDB = require("./database/db");

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT },
  });

  console.log(`server ready at ${url}`);
}

connectDB();

startServer();
