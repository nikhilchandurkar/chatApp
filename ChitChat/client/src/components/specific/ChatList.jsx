import React from 'react';
import { Stack } from '@mui/material';
import PropTypes from 'prop-types'; // For prop validation
import ChatItem from '../shared/ChatItem';

const ChatList = ({
    w = "100%",  
    onlineUsers = [],  
    chats = [], 
    chatId,
    newMessagesAlert = [],  
    handleDeleteChat,
}) => {
    return (
        <Stack width={w} direction={"column"}>
            {chats?.map((data, index) => {
                const { avatar, members, _id, name, groupChat } = data;

                // Find the new message alert for this chat
                const newMessageAlert = newMessagesAlert.find(
                    ({ chatId }) => chatId === _id
                );

                // Check if any member in the chat is online
                const isOnline = members?.some((_member) => onlineUsers.includes(_member));

                return (
                    <ChatItem
                        index={index}
                        name={name}
                        newMessagesAlert={newMessageAlert}
                        isOnline={isOnline}
                        avatar={avatar}
                        _id={_id}
                        key={_id}
                        groupChat={groupChat}  
                        sameSender={chatId === _id}
                        handleDeleteChat={handleDeleteChat}  
                    />
                );
            })}
        </Stack>
    );
};

// Prop validation for better maintainability and debugging

ChatList.propTypes = {
    w: PropTypes.string,
    onlineUsers: PropTypes.arrayOf(PropTypes.string),
    chats: PropTypes.arrayOf(
        PropTypes.shape({
            avatar: PropTypes.array,
            members: PropTypes.arrayOf(PropTypes.string),
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            groupChat: PropTypes.bool,
        })
    ),
    chatId: PropTypes.string,
    newMessagesAlert: PropTypes.arrayOf(
        PropTypes.shape({
            chatId: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
        })
    ),
    handleDeleteChat: PropTypes.func.isRequired,
};

export default ChatList;
