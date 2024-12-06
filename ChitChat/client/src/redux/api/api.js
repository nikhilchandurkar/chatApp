import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import { server } from "../../constants/config";

const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: `${server}/api/v1/` }),
    tagTypes: ["chat"],
    endpoints: (builder) => ({
        myChats: builder.query({
            query: () => ({
                url: "chat/my",
                credentials: "include", 
            }),
            providesTags: ["chat"],
        }),
    }),
});

console.log(api)

export const {useMyChatsQuery} = api; 
console.log(useMyChatsQuery)
export default api;
