import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include",
  }),
  tagTypes: ["User", "UserAddresses"],
  endpoints: (builder) => ({
    // ==================== Authentication ====================
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // ==================== Verification ====================
    verifyUser: builder.mutation({
      query: (token) => ({
        url: `/verify_user/${token}`,
        method: "GET",
      }),
    }),

    // ==================== User Profile ====================
    getCurrentUser: builder.query({
      query: () => "/profile/me",
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "/me/profile/updateProfile",
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["User"],
    }),

    updatePassword: builder.mutation({
      query: (passwordData) => ({
        url: "/me/profile/updatePassword",
        method: "PUT",
        body: passwordData,
      }),
    }),

    updateAvatar: builder.mutation({
      query: (avatarData) => ({
        url: "/me/profile/updateAvatar",
        method: "PUT",
        body: avatarData,
      }),
      invalidatesTags: ["User"],
    }),

    // ==================== Password Management ====================
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/password/forgot",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ token, passwordData }) => ({
        url: `/password/reset/${token}`,
        method: "PUT",
        body: passwordData,
      }),
    }),

    // ==================== Addresses ====================
    getAddresses: builder.query({
      query: () => "/profile/addresses",
      providesTags: ["UserAddresses"],
    }),

    addAddress: builder.mutation({
      query: (data) => ({
        url: "/profile/addresses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserAddresses"],
    }),

    updateAddress: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/profile/addresses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserAddresses"],
    }),

    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/profile/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserAddresses"],
    }),
  }),
});

export const {
  // Authentication
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  // Verification
  useVerifyUserMutation,
  // User Profile
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useUpdateAvatarMutation,
  // Password Management
  useForgotPasswordMutation,
  useResetPasswordMutation,
  // Addresses
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = authApi;
