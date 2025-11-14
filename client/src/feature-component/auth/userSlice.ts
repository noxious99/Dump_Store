import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import { loginApi, signupApi } from "./userApi";
import type { LoginPayload, SignupPayload } from "@/types/user";
import { getUserFromToken } from "@/utils/utils-functions";

interface userState {
  loading: boolean,
  id: string,
  username: string,
  name: string,
  avatar: string,
  email: string,
  token: string,
  error: any,
}

const initialState: userState = {
  loading: true,
  id: "",
  username: "",
  name: "",
  avatar: "",
  email: "",
  token: "",
  error: ""
}

export const loginUser = createAsyncThunk("user/login", async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    const res = await loginApi(payload)
    if (!res.success) {
      return rejectWithValue(res)
    }
    return res
  } catch (error: any) {
    return rejectWithValue(error || "Login failed");
  }
}
)


export const signupUser = createAsyncThunk("user/register", async (payload: SignupPayload, { rejectWithValue }) => {
  try {
    const res = await signupApi(payload)
    if (!res.success) {
      return rejectWithValue(res)
    }
    return res
  } catch (error: any) {
    console.log("111111")
    return rejectWithValue(error || "User Creation failed");
  }
}
)


export const rehydrateUser = createAsyncThunk("user/rehydrate", async (_, { rejectWithValue }) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (!token) return rejectWithValue("No token found");

  const info = getUserFromToken(token);
  if (!info) {
    return rejectWithValue("Token invalid or expired")
  };

  try {
    return { user: info.user, token };
  } catch (err: any) {
    return rejectWithValue(err.message || "Token invalid");
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = ""
      state.name = ""
      state.email = ""
      state.username = ""
      state.avatar = ""
      localStorage.removeItem("ACCESS_TOKEN");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        console.log("action: ", action)
        if (action.payload && action.payload.token) {
          state.token = action.payload.token;
          localStorage.setItem("ACCESS_TOKEN", action.payload.token);
          const info = getUserFromToken(action.payload.token)
          state.id = info?.user.id ?? ""
          state.name = info?.user.name ?? ""
          state.username = info?.user.username ?? ""
          state.avatar = info?.user.avatar ?? ""
          state.email = info?.user.email ?? ""
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.token) {
          state.token = action.payload.token;
          localStorage.setItem("ACCESS_TOKEN", action.payload.token);
          const info = getUserFromToken(action.payload.token)
          state.id = info?.user.id ?? ""
          state.name = info?.user.name ?? ""
          state.username = info?.user.username ?? ""
          state.avatar = info?.user.avatar ?? ""
          state.email = info?.user.email ?? ""
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(rehydrateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(rehydrateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload.user.id;
        state.username = action.payload.user.username;
        state.name = action.payload.user.name;
        state.avatar = action.payload.user.avatar;
        state.email = action.payload.user.email;
        state.token = action.payload.token;
      })
      .addCase(rehydrateUser.rejected, (state, action) => {
        state.loading = false;
        state.token = "";
        state.error = action.payload as string;
      });
  }
})



export const { logout } = userSlice.actions;
export const selectUser = (state: RootState) => state.user

export default userSlice.reducer