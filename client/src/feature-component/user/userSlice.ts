import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";

interface userState {
    name: string,
    email: string
}

const initialState: userState = {
    name: "",
    email: ""
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{name: string, email: string}>) => {
            state.name = action.payload.name
            state.email = action.payload.email
        },
        logout: (state) => {
            state.name = ""
            state.email = ""
        }
    }
})

export const {login, logout} = userSlice.actions
export const selectUser = (state: RootState) => state.user
export const selectUserName = (state: RootState) => state.user.name;
export const selectUserEmail = (state: RootState) => state.user.email;
export default userSlice.reducer