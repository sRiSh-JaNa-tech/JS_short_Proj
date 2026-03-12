"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const task_Router_1 = __importDefault(require("./routes/task_Router"));
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express_1.default.static('public'));
const User_1 = __importDefault(require("./models/User"));
app.get('/', async (req, res) => {
    try {
        let user = await User_1.default.findOne();
        if (!user) {
            user = new User_1.default({
                userId: new mongoose_1.default.Types.ObjectId(),
                name: 'Default User',
                email: 'default@example.com',
                tasks: []
            });
            await user.save();
        }
        res.render('home', { title: "Home Page", userId: user._id });
    }
    catch (error) {
        res.status(500).send("Error loading home page");
    }
});
app.use('/tasks', task_Router_1.default);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
    mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskdb');
});
//# sourceMappingURL=server.js.map