import { compare } from "bcrypt";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMembers } from "../lib/helper.js";
import { tryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from '../models/request.js';
import { User } from "../models/user.js";
import {
    cookieOption,
    emitEvent,
    sendToken,
    uploadFilesToCloudinary
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";


// Create new user, save in DB, and set a cookie
const newUser = tryCatch(async (req, res, next) => {
    const { name, username, password, bio } = req.body;
    const file = req.file;

    // Validate required fields
    if (!name || !username || !password) {
        return next(new ErrorHandler("Please fill all required fields", 400));
    }

    if (!file) {
        return next(new ErrorHandler("Please upload an avatar", 400));
    }

    // Upload file to cloud storage
    const result = await uploadFilesToCloudinary([file]);
    if (!result || !result[0]) {
        return next(new ErrorHandler("Avatar upload failed", 500));
    }

    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
    };

    // Check for existing username
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return next(new ErrorHandler("Username already exists", 400));
    }


    // Create user
    const user = await User.create({
        name,
        bio,
        username,
        password,
        avatar,
    });

    // Send response with token
    sendToken(res, user, 201, "User Created");
});


// Login user
const login = tryCatch(async (req, res, next) => {
    const { username, password } = req.body;

    // Fetch user and select password field explicitly
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid username or password", 404));
    }

    // Compare the provided password with the stored password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
        return next(new ErrorHandler("Invalid username or password", 404));
    }

    // Send token if authentication is successful
    sendToken(res, user, 201, `Welcome back ${user.name}`);
});

// Get user profile
const getMyProfile = tryCatch(async (req, res, next) => {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

const logout = tryCatch(async (req, res, next) => {

    res.status(200).cookie("chitChat-Token", "", {
        ...cookieOption, maxAge: 0
    }).json({
        success: true,
        message: "logout"
    });
});


const searchUser = tryCatch(async (req, res, next) => {
    const { name = "" } = req.query;

    // Fetch all direct (non-group) chats the user is a part of
    const myChats = await Chat.find({
        GroupChat: false,
        members: req.user
    });

    // Flatten all members in these chats to create a list of user's friends
    const allUsersFromMyChats = myChats.map(chat => chat.members).flat();

    // Search for users not in the user's chats and match the query name
    const allUserExceptMeAndMyFriends = await User.find({
        _id: { $nin: allUsersFromMyChats },
        name: { $regex: name, $options: "i" }
    });

    // Format users with only necessary fields
    const users = allUserExceptMeAndMyFriends.map(({ _id, avatar, name }) => ({
        _id,
        name,
        avatar: avatar.url
    }));

    res.status(200).json({
        success: true,
        user: req.user,
        users
    });
});

const sendFriendRequest = tryCatch(async (req, res, next) => {
    const { userId } = req.body;

    const request = await Request.findOne({
        $or: [
            { sender: req.user, receiver: userId },
            { sender: userId, receiver: req.user },
        ],
    });

    // If a request already exists, throw an error
    if (request) {
        return next(new ErrorHandler("Request already sent", 400));
    }

    // Create a new friend request
    await Request.create({
        sender: req.user,
        receiver: userId,
    });

    // Emit an event indicating a new friend request
    emitEvent(req.user, NEW_REQUEST, userId, "request");

    res.status(200).json({
        success: true,
        message: "Friend request sent successfully.",
    });
});

const acceptFriendRequest = tryCatch(async (req, res, next) => {
    const { requestId, accept } = req.body;

    const request = await Request.findById(requestId)
        .populate("sender", "name")
        .populate("receiver", "name");

    if (!request) return next(new ErrorHandler("Request not found", 404));

    // Check if the user is authorized to accept the request
    if (request.receiver._id.toString() !== req.user.toString())
        return next(new ErrorHandler("Unauthorized", 401));

    // If request is rejected
    if (!accept) {
        await request.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Request deleted successfully",
        });
    }

    // If request is accepted
    const members = [request.sender._id, request.receiver._id];

    await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name} -- ${request.receiver.name}`
        }),
        request.deleteOne(),
    ]);

    emitEvent(req, REFETCH_CHATS, members);

    return res.status(200).json({
        success: true,
        message: "Friend request accepted",
        senderId: request.sender._id,
    });
});


const getNotifications = tryCatch(async (req, res, next) => {
    const requests = await Request.find({ receiver: req.user })
        .populate("sender", "name avatar");

    const allRequests = requests.map(({ _id, sender }) => ({
        _id,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar?.url || null
        }
    }));

    res.status(200).json({
        success: true,
        message: "Notifications fetched successfully",
        allRequests
    });
});

const getMyAllFriends = tryCatch(async (req, res, next) => {
    const { chatId } = req.query;

    const chats = await Chat.find({
        members: req.user,
        GroupChat: false
    }).populate("members", "name avatar");

    const friends = chats.map(({ members }) => {
        const otherUser = getOtherMembers(members, req.user);
        if (!otherUser) return null; // Skip if no other user found
        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar?.url || null
        };
    }).filter(Boolean); // Remove any null entries from the array

    if (chatId) {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }
        const availableFriends = friends.filter(
            (friend) => !chat.members.includes(friend._id)
        );
        return res.status(200).json({
            success: true,
            friends: availableFriends
        });
    }

    res.status(200).json({
        success: true,
        friends
    });
});


export {
    acceptFriendRequest,
    getMyAllFriends,
    getMyProfile,
    getNotifications,
    login,
    logout,
    newUser,
    searchUser,
    sendFriendRequest
};

