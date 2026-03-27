import express, { Request, Response } from 'express';
import cors from "cors";
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

import taskRouter from './routes/task_Router';
import { typeDefs } from './schemas/index';
import { resolvers } from './resolvers/index';
import User from './models/User';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

async function startServer() {
  // ✅ Connect DB first
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/taskdb');
  console.log("MongoDB connected");

  // ✅ Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
  });

  // ✅ Start server
  await server.start();

  // ✅ Attach middleware AFTER start
  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server)
  );

  // REST routes
  app.get('/health', async (req: Request, res: Response) => {
    res.json({ message: "Server is running........" });
  });

  app.get('/', async (req: Request, res: Response) => {
    try {
      let user = await User.findOne();
      if (!user) {
        user = new User({
          userId: new mongoose.Types.ObjectId(),
          name: 'Default User',
          email: 'default@example.com',
          tasks: []
        });
        await user.save();
      }
      res.render('home', { title: "Home Page", userId: user._id });
    } catch (error) {
      res.status(500).send("Error loading home page");
    }
  });

  app.use('/tasks', taskRouter);

  // ✅ Start Express server LAST
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL at http://localhost:${PORT}/graphql`);
  });
}

startServer();