import { api } from "./api";
import { NotificationItem, NotificationListResponse } from "@/lib/types";

export interface GetNotificationsParams {
  unread?: boolean;
  module?: string;
  limit?: number;
  offset?: number;
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationListResponse, GetNotificationsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.unread) queryParams.set("unread", "true");
        if (params?.module && params.module !== "all") queryParams.set("module", params.module);
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.offset) queryParams.set("offset", String(params.offset));
        const qs = queryParams.toString();
        return `/notifications${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Notification"],
    }),

    markNotificationRead: builder.mutation<NotificationItem, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: builder.mutation<
      { status: string; marked_read_count: number },
      { module?: string } | void
    >({
      query: (arg) => {
        const module = arg?.module && arg.module !== "all" ? `?module=${arg.module}` : "";
        return {
          url: `/notifications/mark-all-read${module}`,
          method: "POST",
        };
      },
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<
      { status: string; deleted_id: string },
      string
    >({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    clearAllNotifications: builder.mutation<
      { status: string; cleared_count: number },
      { onlyRead?: boolean } | void
    >({
      query: (arg) => {
        const onlyRead = arg?.onlyRead ? "?only_read=true" : "";
        return {
          url: `/notifications/clear-all${onlyRead}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} = notificationsApi;
