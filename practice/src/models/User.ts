import mongoose, {Schema, Types} from 'mongoose';
import Task, { ITask } from './Task';

export interface IUser {
    userId : mongoose.Types.ObjectId,
    name : String,
    email : String,
    tasks : ITask[],
    addTask : (taskId : Types.ObjectId) => Promise<IUser>,
    updateTasks : (taskId : Types.ObjectId, updateData : Partial<ITask>) => Promise<ITask | null>,
    markComplete(taskId: Types.ObjectId): Promise<ITask | null>,
    deleteTask(taskId: Types.ObjectId): Promise<Types.ObjectId>
};

const userSchema = new Schema<IUser>({
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true
        },
    name : {
        type : String, 
        required : true
    },
    email : {
        type : String,
        required : true
    },
    tasks : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Task'
    }]
});

userSchema.methods.addTask = async function(taskId: Types.ObjectId) {
    this.tasks.push(taskId);
    return await this.save();
};

userSchema.methods.updateTasks = async function(taskId: Types.ObjectId, updateData: Partial<ITask>) {
    return Task.findByIdAndUpdate(taskId, updateData, { new: true });
};

userSchema.methods.markComplete = async function(taskId : Types.ObjectId){
    const task = await Task.findById(taskId);
    if(!task){
        throw new Error("Task not found");
    }
    task.completed = !task.completed;
    await task.save();
    return task;
}

userSchema.methods.deleteTask = async function(taskId : Types.ObjectId){

    await Task.findByIdAndDelete(taskId);

    this.tasks = this.tasks.filter(
        (t : Types.ObjectId) => !t.equals(taskId)
    );

    await this.save();

    return taskId;
}

export default mongoose.model<IUser>('User', userSchema);