import {
  Add as AddIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Backdrop,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import axios from "axios";
import React, { Suspense, lazy, useState } from 'react';
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { server } from '../../constants/config';
import { userExists } from "../../redux/reducers/auth";
const SearchDialog = lazy(() => import("../specific/Search"));
const NotificationsDialog = lazy(() => import("../specific/Notifications"));
const NewGroupsDialog = lazy(() => import("../specific/NewGroup"));
const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [isNotification, setIsNotification] = useState(false);

  const handleMobile = () => setIsMobile((prev) => !prev);
  const openSearch = () => setIsSearch((prev) => !prev);
  const addNewGroup = () => setIsNewGroup((prev) => !prev);
  const openNotification = () => setIsNotification((prev) => !prev);


  const logoutHandler = async () => {
    try {
      console.log(server)
      const { data } = await axios.post(`${server}/api/v1/user/logout`, {},
        { withCredentials: true, });
      dispatch(userExists());
      toast.success(data.message);
      console.log(data);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "something went wrong");
    }
  };
  const navigateToGroup = () => navigate("/groups");

  return (
    <>
      <Box sx={{ flexGrow: 1 }} height="4rem">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" } }}>
              Chat App
            </Typography>

            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <IconButton color="inherit" onClick={handleMobile}>
                <MenuIcon />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box>
              <IconBtn title="Search" icon={<SearchIcon />} onClick={openSearch} />
              <IconBtn title="New Group" icon={<AddIcon />} onClick={addNewGroup} />
              <IconBtn title="Manage Groups" icon={<GroupIcon />} onClick={navigateToGroup} />
              <IconBtn title="Notifications" icon={<NotificationsIcon />} onClick={openNotification} />
              <IconBtn title="Logout" icon={<LogoutIcon />} onClick={logoutHandler} />
            </Box>
          </Toolbar>
        </AppBar>
      </Box>

      {isSearch && (
        <Suspense fallback={<Backdrop open><Typography>Loading...</Typography></Backdrop>}>
          <SearchDialog />
        </Suspense>
      )}

      {isNotification && (
        <Suspense fallback={<Backdrop open><Typography>Loading...</Typography></Backdrop>}>
          <NotificationsDialog />
        </Suspense>
      )}

      {isNewGroup && (
        <Suspense fallback={<Backdrop open><Typography>Loading...</Typography></Backdrop>}>
          <NewGroupsDialog />
        </Suspense>
      )}
    </>
  );
};

const IconBtn = ({ title, icon, onClick }) => {
  return (
    <Tooltip title={title}>
      <IconButton color="inherit" size="large" onClick={onClick} aria-label={title}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default Header;
