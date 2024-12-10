import {
  AttachFile as AttachFileIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { IconButton, Stack } from '@mui/material';
import React, { useRef, useState } from 'react';
import Filemenu from '../components/dialogs/Filemenu';
import AppLayout from '../components/layout/AppLayout';
import MessageComponent from '../components/shared/MessageComponent';

// import { sampleMessages } from '../constants/sampleData';

import { orange } from '@mui/material/colors';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sampleMessages } from '../constants/sampleData';

const Chat = ({ chatId, user }) => {
  // const socket =
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);


  const [message, setMessage] = useState("");
  const [messages, useMessages] = useState("");
  const [page, setPage] = useState([]);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

  const handleSubmit = (e) => {


    e.preventDefault();
    if (message.trim()) {
      // Handle sending message logic here, e.g., updating state or API call
      console.log("Message Sent: ", message);
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={"rgba(247,247,247,1)"}
        height={"90%"}
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {sampleMessages.map((i) => (
          <MessageComponent
            key={i._id}
            message={i}
            user={user}
          />
        ))}
      </Stack>

      <form
        onSubmit={handleSubmit}
        style={{
          height: "10%",
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Stack direction={"row"} height={"100%"} padding={"1rem"} alignItems={"center"} position={"relative"} flex={1}>
          <IconButton sx={{
            position: "absolute",
            left: "1.5rem",
            rotate: "-30deg",
            color: "secondary.main",
            "&:hover": {
              bgcolor: "secondary.dark"
            }
          }}>
            <AttachFileIcon />
          </IconButton>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message here..."
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              padding: "0 3rem",
              borderRadius: "1.5rem",
              backgroundColor: "rgba(247,247,247,1)",
            }}
          />

          <IconButton type='submit'
            sx={{
              backgroundColor: orange,
              color: "white",
              marginLeft: "1rem",
              padding: "0.5rem",
              "&:hover": {
                bgcolor: "error.dark"
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>

      <Filemenu />
    </>
  );
};

export default AppLayout()(Chat);
