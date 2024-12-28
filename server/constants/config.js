

const corsOption = {
    origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        process.env.CLIENT_URL,
        process.env.NODE_ENV === 'production' 
    ],
    methodz:["POST", "GET", "PUT", "DELETE", "UPDATE"],
    credentials: true,
}

const chitChatTocken="chitChat-Token"

export{corsOption,chitChatTocken }