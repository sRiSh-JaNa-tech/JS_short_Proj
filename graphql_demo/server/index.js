const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express4");
const { ApolloServerPluginLandingPageLocalDefault } = require("@apollo/server/plugin/landingPage/default");
const { default : axios} = require("axios");

async function startServer() {
  const app = express();

  const typeDefs = `
    type Todo {
      id: ID!
      title: String!
      completed: Boolean
    }

    type Query {
      getTodos: [Todo]
    }
  `;

  const resolvers = {
    Query: {
      getTodos: () => [
        { id: "1", title: "Learn GraphQL", completed: false },
        { id: "2", title: "Build Project", completed: true },
      ],
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
  });

  await server.start();

  app.use(cors());
  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server)
  );

  app.listen(8000, () => {
    console.log("Server running at http://localhost:8000/graphql");
  });
}

startServer();