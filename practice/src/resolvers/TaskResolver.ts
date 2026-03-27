import Task from '../models/Task';

export const taskQueries = {
    getTasks: async () => await Task.find(),
    getTask: async (_: any, { id }: { id: string }) => await Task.findById(id),
};

export const taskMutations = {
    addTask: async (_: any, args: any) => {
        const newTask = new Task({ ...args, completed: false });
        return await newTask.save();
    },
    updateTask: async (_: any, { id, ...updates }: any) => {
        return await Task.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteTask: async (_: any, { id }: { id: string }) => {
        await Task.findByIdAndDelete(id);
        return id;
    }
};
