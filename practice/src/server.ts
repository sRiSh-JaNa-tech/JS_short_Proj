import express from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import taskRouter from './routes/task_Router';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));

import User from './models/User';

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/taskdb');
});