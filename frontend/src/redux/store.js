import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
// import { colorApi } from "@/redux/api/colorApi";
import { authApi } from "@/redux/api/authApi";

export const store = configureStore({
  reducer: {
    // [colorApi.reducerPath]: colorApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    // getDefaultMiddleware().concat(colorApi.middleware),
    getDefaultMiddleware().concat(authApi.middleware),
});

setupListeners(store.dispatch);

export default store;
