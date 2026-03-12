import express from "express";
import { Request, Response } from "express";
import { Types } from "mongoose";

import User, { IUser } from "../models/User";
import TaskSchema, { ITask } from "../models/Task";
import Task from "../models/Task";

const router = express.Router();

interface Params{
    userId : string,
    taskId : string,
};

router.post('/:userId/create-task', async (req : Request, res : Response) => {
    const { userId } = req.params;
    const { title, description, priority, dueDate } = req.body;
    const newTask = new TaskSchema<ITask>({
        title, 
        description,
        priority,
        dueDate,
        completed: false,
        createdAt: new Date()
    });
    await newTask.save();
    const user = await User.findById(userId);
    if (user) {
        await user.addTask(newTask._id);
    }
    res.status(201).json(newTask);
});

router.get("/:userId/get-all-Task",async (req : Request, res : Response) => {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('tasks');
    if( !user ){
        return res.status(404).json({ message: 'User not found' });
    }
    try {
        res.json(user.tasks);
    } catch {
        res.status(500).json({ error: "Server error" });
    }
});

router.put('/:userId/update-task/:taskId', async (req : Request<Params>, res : Response) => {
    const taskId = new Types.ObjectId(req.params.taskId);
    const { userId } = req.params;
    const { title, description, priority, dueDate, completed } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    await user.updateTasks(taskId, { title, description, priority, dueDate, completed });
    const updatedTask = await TaskSchema.findById(taskId);
    if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
});

router.put("/:userId/done/:taskId", async (req : Request<Params>, res : Response) => {
    const taskId = new Types.ObjectId(req.params.taskId);
    const {userId} = req.params;
    const status = req.query;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    await user.markComplete(taskId);
    const updatedTask = await TaskSchema.findById(taskId);
    if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
});

router.put("/:userId/delete/:taskId",async (req : Request<Params>, res : Response) => {
    const taskId = new Types.ObjectId(req.params.taskId);
    const {userId} = req.params;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    await user.deleteTask(taskId);
    res.status(200).json({
        message : "Task delete successfully"
    });
});

export default router;