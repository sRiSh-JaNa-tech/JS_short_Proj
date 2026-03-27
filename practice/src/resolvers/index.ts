import { taskQueries, taskMutations } from './TaskResolver';
import { userQueries, userMutations } from './UserResolver';

export const resolvers = {
    Query: {
        ...taskQueries,
        ...userQueries
    },
    Mutation: {
        ...taskMutations,
        ...userMutations
    }
};