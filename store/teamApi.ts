import { api } from "./api";

export type RoleType =
  | "IMPORTER"
  | "EXPORTER"
  | "CUSTOMS_BROKER"
  | "TRADE_ADVISOR"
  | "TRADE_OFFICER"
  | "AUDITOR"
  | "ADMIN";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  role: RoleType;
  twoFactorEnabled: boolean;
  isOwner?: boolean;
  lastActive: string;
  avatarColor: string;
  createdAt?: string;
}

export interface TeamResponse {
  members: TeamMember[];
  seatLimit: number;
  usedSeats: number;
  remainingSeats: number;
  isUnlimited: boolean;
  planName: string;
  tier: string;
  canInviteMore: boolean;
}

export interface InviteMemberPayload {
  email: string;
  name: string;
  role: string;
  department?: string;
  password?: string;
}

export interface UpdateMemberPayload {
  userId: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  password?: string;
}

export const teamApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTeamMembers: builder.query<TeamResponse, void>({
      query: () => "/settings/team",
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return {
            members: response,
            seatLimit: 5,
            usedSeats: response.length,
            remainingSeats: Math.max(0, 5 - response.length),
            isUnlimited: false,
            planName: "Workspace",
            tier: "STARTER",
            canInviteMore: response.length < 5,
          };
        }
        return response as TeamResponse;
      },
      providesTags: ["Team"],
    }),

    inviteTeamMember: builder.mutation<TeamMember, InviteMemberPayload>({
      query: (body) => ({
        url: "/settings/team/invite",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team"],
    }),

    updateTeamMember: builder.mutation<TeamMember, UpdateMemberPayload>({
      query: ({ userId, ...body }) => ({
        url: `/settings/team/${userId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Team"],
    }),

    removeTeamMember: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/settings/team/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Team"],
    }),
  }),
});

export const {
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useRemoveTeamMemberMutation,
} = teamApi;

