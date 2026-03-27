export const userTypeDefs = `#graphql
  type User {
    id: ID!
    userId: ID!
    name: String!
    email: String!
    tasks: [Task]
  }
`;