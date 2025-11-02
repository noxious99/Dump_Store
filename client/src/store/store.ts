import { configureStore } from '@reduxjs/toolkit'
import { counterSlice } from '../feature-component/CounterSlice'
import { userSlice } from '../feature-component/auth/userSlice'
// ...

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    user: userSlice.reducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch