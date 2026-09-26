import { api } from "./api";
import { AksharaRequest, AksharaResponse } from "@/lib/types";

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
  }),
  overrideExisting: false,
});

export const { useSendChatMessageMutation } = aksharaApi;
