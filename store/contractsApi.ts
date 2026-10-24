import { api } from "./api";

export interface FreightContract {
  id: string;
  origin: string;
  destination: string;
  carrier: string;
  contractCode: string;
  rateUsd: number;
  unit: string;
  expiryDate: string;
}

export interface SmelterYieldOverride {
  id: string;
  materialGrade: string;
  baseYieldPct: number;
  smelterLossPct: number;
  furnaceType: string;
  facility: string;
}

export interface ContractsResponse {
  freightContracts: FreightContract[];
  smelterYieldOverrides: SmelterYieldOverride[];
}

export interface CreateFreightContractPayload {
  origin: string;
  destination: string;
  carrier: string;
  contractCode: string;
  rateUsd: number;
  unit?: string;
  expiryDate?: string;
}

export interface CreateSmelterYieldPayload {
  materialGrade: string;
  baseYieldPct: number;
  smelterLossPct: number;
  furnaceType: string;
  facility: string;
}

export const contractsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContracts: builder.query<ContractsResponse, void>({
      query: () => "/settings/contracts",
      providesTags: ["Contracts"],
    }),

    createFreightContract: builder.mutation<
      FreightContract,
      CreateFreightContractPayload
    >({
      query: (body) => ({
        url: "/settings/contracts/freight",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contracts"],
    }),

    deleteFreightContract: builder.mutation<{ message: string }, string>({
      query: (contractId) => ({
        url: `/settings/contracts/freight/${contractId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contracts"],
    }),

    createSmelterOverride: builder.mutation<
      SmelterYieldOverride,
      CreateSmelterYieldPayload
    >({
      query: (body) => ({
        url: "/settings/contracts/smelter",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contracts"],
    }),

    deleteSmelterOverride: builder.mutation<{ message: string }, string>({
      query: (overrideId) => ({
        url: `/settings/contracts/smelter/${overrideId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contracts"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContractsQuery,
  useCreateFreightContractMutation,
  useDeleteFreightContractMutation,
  useCreateSmelterOverrideMutation,
  useDeleteSmelterOverrideMutation,
} = contractsApi;
