import { Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';



const Filemenu = ({ anchorEl, onClose }) => {
  const { isFilemenu } = useSelector((state) => state.misc);
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false);
  // const closeFileMenu = () => dispatch(setIsFileMenu(false));

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}
    >
      <div>
        <MenuItem onClick={onClose}>Option 1</MenuItem>
        <MenuItem onClick={onClose}>Option 2</MenuItem>
        <MenuItem onClick={onClose}>Option 3</MenuItem>
      </div>

    </Menu>
  );
}

export default Filemenu;
