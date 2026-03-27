import mongoose from 'mongoose';
import User from '../models/User';

export const userQueries = {
    getUsers: async () => await User.find().populate('tasks'),
    getUser: async (_: any, { id }: { id: string }) => await User.findById(id).populate('tasks'),
};

export const userMutations = {
    createUser: async (_: any, { name, email }: any) => {
        const userId = new mongoose.Types.ObjectId();
        const newUser = new User({ userId, name, email, tasks: [] });
        return await newUser.save();
    },
    assignTaskToUser: async (_: any, { userId, taskId }: { userId: string, taskId: string }) => {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");
        
        // Prevent duplicate task assignments
        const taskObjectId = new mongoose.Types.ObjectId(taskId);
        const tasks = user.tasks as unknown as mongoose.Types.ObjectId[];
        if (!tasks.some(t => t.equals(taskObjectId))) {
            tasks.push(taskObjectId);
            await user.save();
        }
        
        return await user.populate('tasks');
    },
    removeTaskFromUser: async (_: any, { userId, taskId }: { userId: string, taskId: string }) => {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");
        
        const taskObjectId = new mongoose.Types.ObjectId(taskId);
        const tasks = user.tasks as unknown as mongoose.Types.ObjectId[];
        user.tasks = tasks.filter(t => !t.equals(taskObjectId)) as unknown as any;
        await user.save();
        
        return await user.populate('tasks');
    }
};
