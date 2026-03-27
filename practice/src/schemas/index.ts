import { taskTypeDefs } from './taskSchema';
import { userTypeDefs } from './UserSchema';

export const typeDefs = `#graphql
  ${taskTypeDefs}
  ${userTypeDefs}

  type Query {
    getTasks: [Task]
    getTask(id: ID!): Task
    
    getUsers: [User]
    getUser(id: ID!): User
  }

  type Mutation {
    addTask(title: String!, description: String, priority: String, dueDate: String): Task
    updateTask(id: ID!, title: String, description: String, completed: Boolean, priority: String, dueDate: String): Task
    deleteTask(id: ID!): String

    createUser(name: String!, email: String!): User
    assignTaskToUser(userId: ID!, taskId: ID!): User
    removeTaskFromUser(userId: ID!, taskId: ID!): User
  }
`;