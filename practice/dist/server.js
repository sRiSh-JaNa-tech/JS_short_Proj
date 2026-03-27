"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("@apollo/server");
const express4_1 = require("@as-integrations/express4");
const default_1 = require("@apollo/server/plugin/landingPage/default");
const task_Router_1 = __importDefault(require("./routes/task_Router"));
const index_1 = require("./schemas/index");
const index_2 = require("./resolvers/index");
const User_1 = __importDefault(require("./models/User"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express_1.default.static('public'));
const PORT = process.env.PORT || 3000;
async function startServer() {
    // ✅ Connect DB first
    await mongoose_1.default.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/taskdb');
    console.log("MongoDB connected");
    // ✅ Create Apollo Server
    const server = new server_1.ApolloServer({
        typeDefs: index_1.typeDefs,
        resolvers: index_2.resolvers,
        plugins: [(0, default_1.ApolloServerPluginLandingPageLocalDefault)()],
    });
    // ✅ Start server
    await server.start();
    // ✅ Attach middleware AFTER start
    app.use("/graphql", express_1.default.json(), (0, express4_1.expressMiddleware)(server));
    // REST routes
    app.get('/health', async (req, res) => {
        res.json({ message: "Server is running........" });
    });
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
    // ✅ Start Express server LAST
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`GraphQL at http://localhost:${PORT}/graphql`);
    });
}
startServer();
//# sourceMappingURL=server.js.map