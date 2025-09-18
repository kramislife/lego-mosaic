import { configureStore } from "@reduxjs/toolkit";
import { colorApi } from "@/redux/api/colorApi";

export const store = configureStore({
  reducer: {
    [colorApi.reducerPath]: colorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(colorApi.middleware),
});

export default store;
