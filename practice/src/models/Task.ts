import mongoose, { Schema, Types} from 'mongoose';

export interface ITask {
    title : String, 
    description : String,
    completed : Boolean,
    priority : "low" | "medium" | "high",
    createdAt : Date,
    dueDate : Date
}

const taskSchema = new Schema<ITask>({
    title : {
        type : String,
        required : true
    },
    description : String,
    completed : Boolean,
    priority : {
        type : String, 
        enum : ['low', 'medium', 'high'],
        default : 'medium'
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    dueDate : Date
});

export default mongoose.model<ITask>('Task', taskSchema);