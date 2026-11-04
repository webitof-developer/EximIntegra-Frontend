import { api } from "./api";
import {
  AksharaRequest,
  AksharaResponse,
  AksharaMessage,
  MaterialContext,
} from "@/lib/types";

export interface AksharaConversationSummary {
  id: string;
  userId?: string;
  title: string;
  activeContext?: Partial<MaterialContext>;
  createdAt?: string;
  updatedAt?: string;
  messageCount: number;
  lastMessageSnippet?: string;
  isShared?: boolean;
}

export interface AksharaConversationDetail {
  id: string;
  userId?: string;
  title: string;
  activeContext?: Partial<MaterialContext>;
  createdAt?: string;
  updatedAt?: string;
  messages: AksharaMessage[];
  isShared?: boolean;
}

export interface ShareConversationResponse {
  status: string;
  conversationId: string;
  title: string;
  messageCount: number;
  formattedMarkdown: string;
  shareUrl: string;
}

export const aksharaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendChatMessage: builder.mutation<AksharaResponse, AksharaRequest>({
      query: (body) => ({
        url: "/akshara/chat",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Akshara"],
    }),

    getConversations: builder.query<AksharaConversationSummary[], void>({
      query: () => "/akshara/conversations",
      providesTags: ["Akshara"],
    }),

    getConversation: builder.query<AksharaConversationDetail, string>({
      query: (id) => `/akshara/conversations/${id}`,
    }),

    deleteConversation: builder.mutation<{ status: string; conversation_id: string }, string>({
      query: (id) => ({
        url: `/akshara/conversations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Akshara"],
    }),

    clearAllConversations: builder.mutation<{ status: string; count: number }, void>({
      query: () => ({
        url: "/akshara/conversations",
        method: "DELETE",
      }),
      invalidatesTags: ["Akshara"],
    }),

    shareConversation: builder.mutation<ShareConversationResponse, string>({
      query: (id) => ({
        url: `/akshara/conversations/${id}/share`,
        method: "POST",
      }),
      invalidatesTags: ["Akshara"],
    }),

    getSharedConversation: builder.query<AksharaConversationDetail, string>({
      query: (id) => `/akshara/shared/${id}`,
    }),
  }),
  overrideExisting: false,
});

export const {
  useSendChatMessageMutation,
  useGetConversationsQuery,
  useGetConversationQuery,
  useLazyGetConversationQuery,
  useDeleteConversationMutation,
  useClearAllConversationsMutation,
  useShareConversationMutation,
  useGetSharedConversationQuery,
  useLazyGetSharedConversationQuery,
} = aksharaApi;
