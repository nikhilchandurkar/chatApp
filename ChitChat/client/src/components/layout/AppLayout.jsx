import { Drawer, Grid, Skeleton } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import sampleChats from '../../constants/sampleData';
import { useErrors } from '../../hooks/hook';
import { useMyChatsQuery } from '../../redux/api/api';
import { setIsMobile } from '../../redux/reducers/misc';
import ChatList from '../specific/ChatList';
import Profile from '../specific/Profile';
import Header from './Header';




const AppLayout = () => (WrappedComponent) => {

  return (props) => {

    const dispatch = useDispatch();
    const { chatId } = useParams();
    const { data, isLoading, isError, refetch, error } = useMyChatsQuery("")
    

    const { isMobile } = useSelector((state) => state.misc);
    

    useErrors([{ isError,error }]);


    const handleDeleteChats = (e, _id, groupChat) => {
      e.preventDefault();
      console.log("deleteChat", _id, groupChat);
    }

    const handleMobileClose = () => dispatch(setIsMobile(false))


    return (
      <>
        <Header />

        {
          isLoading ? (<Skeleton />) : (
            <Drawer
              open={isMobile}
              onClose={handleMobileClose}

            >
              <ChatList
                w="70vw"
                handleDeleteChat={handleDeleteChats}
                chats={data?.chats || sampleChats}
                chatId={chatId}
                onlineUsers={["0", "1", "2", "3"]}
              />
            </Drawer>
          )

        }

        <Grid container height={"calc(100vh - 4rem)"}>
          <Grid item height={"100%"}
            sm={4}
            md={3}
            lg={3}
            sx={{
              display: { xs: "none", sm: "block" },
            }}
            aria-label="Chat List"
          >

            {
              isLoading ? (<Skeleton />) : (
                <ChatList
                  handleDeleteChat={handleDeleteChats}
                  chats={data?.chats || sampleChats}
                  chatId={chatId}
                  onlineUsers={["0", "1", "2", "3"]}
                />
              )
            }
          </Grid>
          <Grid item
            xs={12}
            sm={8}
            md={5}
            lg={6}
            height={"100%"}
          >
            <WrappedComponent {...props} />

          </Grid>

          <Grid item height={"100%"}
            md={4}
            lg={3}
            sx={{
              display: { xs: "none", md: "block" },
              padding: "2rem",
              bgcolor: "rgba(0,0,0,1)",
            }}
          >
            <Profile  />
          </Grid>
        </Grid>
      </>
    )
  }
}

export default AppLayout;
