export const taskTypeDefs = `#graphql
  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean
    priority: String
    createdAt: String
    dueDate: String
  }
`;