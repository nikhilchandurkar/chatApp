import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from "dotenv";
import express from "express";
import { createServer } from 'http';
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { NEW_MESSAGE } from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { socketAuthenticator } from "./middlewares/auth.js";
import { errorMiddleware } from "./middlewares/error.js";
import { Message } from "./models/message.js";
import adminRoute from "./routes/admin.js";
import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { corsOption } from "./constants/config.js";



dotenv.config({
    path: "./.env"
});

const MONGO_URI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

connectDB(MONGO_URI);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});


const userSocketIDs = new Map();

const app = express();
const server = createServer(app);
const io = new Server(server,
    {
        cors:corsOption
    }
);

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOption));


// app.use(express.static(path.join(__dirname, '../client/dist')));


// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// });

app.get("/", (req,res)=>{
    res.json("hello its chatAPI")
});


app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);





io.use((socket, next) => {
    cookieParser()(
        socket.request,
        socket.request.res,
        async (err) => await socketAuthenticator(err, socket, next)
    )
})


io.on("connection", (socket) => {
    const user = socket.user;

    userSocketIDs.set(user._id.toString(), socket.id);
    console.log("Connected users:", userSocketIDs);
    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name,
            },
            chat: chatId,
            createdAt: new Date().toISOString(),
        };

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,
        };
        console.log("emmitng",messageForRealTime)
        const membersSocket = getSockets(members, userSocketIDs);
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime,
        });
        io.to(membersSocket).emit("NEW_MESSAGE_COUNT", { chatId });
        try {
            await Message.create(messageForDB);
        } catch (error) {
            console.log(error)

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
export default app

export  {userSocketIDs};

