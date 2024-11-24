

import { configureStore } from "@reduxjs/toolkit";
import authSclice from "./reducers/auth";

const store = configureStore({
    reducer: {
        [authSclice.name]: authSclice.reducer,
    },

});


export default store;