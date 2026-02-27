import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: null | { id: string; username: string; email: string };
  token: null | string;
  loading: boolean;
  error: null | string;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    logIn: (
      state,
      action: PayloadAction<{
        user: { id: string; username: string; email: string };
        token: string;
      }>
    ) => {
      // Assign the user object instead of using optional chaining
      // on the left-hand side which is invalid syntax.
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { logIn, logOut } = authSlice.actions;

export default authSlice.reducer;
