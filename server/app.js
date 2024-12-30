dotenv.config({ path: "./.env" });

const MONGO_URI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

// Validate environment variables
if (!MONGO_URI || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing critical environment variables.");
    process.exit(1);
}

try {
    connectDB(MONGO_URI);
} catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userSocketIDs = new Map();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOption });

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOption));

app.get("/", (req, res) => {
    res.json("hello its chatAPI");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);

io.use((socket, next) => {
    try {
        cookieParser()(socket.request, socket.request.res, async (err) => await socketAuthenticator(err, socket, next));
    } catch (error) {
        console.error("Socket authentication error:", error.message);
        next(new Error("Authentication failed"));
    }
});

io.on("connection", (socket) => {
    const user = socket.user;

    userSocketIDs.set(user._id.toString(), socket.id);
    console.log("Connected users:", userSocketIDs);

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        try {
            const messageForRealTime = {
                content: message,
                _id: uuid(),
                sender: { _id: user._id, name: user.name },
                chat: chatId,
                createdAt: new Date().toISOString(),
            };

            const messageForDB = {
                content: message,
                sender: user._id,
                chat: chatId,
            };

            const membersSocket = getSockets(members, userSocketIDs);

            io.to(membersSocket).emit(NEW_MESSAGE, { chatId, message: messageForRealTime });
            io.to(membersSocket).emit("NEW_MESSAGE_COUNT", { chatId });

            await Message.create(messageForDB);
        } catch (error) {
            console.error("Error handling new message:", error.message);
        }
    });

    socket.on("disconnect", () => {
        userSocketIDs.delete(user._id.toString());
        console.log("User disconnected, updated users:", userSocketIDs);
    });
});

app.use(errorMiddleware);

// Start the server
server.listen(port, () => {
    console.log(`Server is running at port ${port} in ${process.env.NODE_ENV}`);
});

export { app, userSocketIDs };
