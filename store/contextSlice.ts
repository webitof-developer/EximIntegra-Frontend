import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MaterialContext } from "@/lib/types";

interface ContextState {
  current: MaterialContext;
  history: MaterialContext[];
}

const initialState: ContextState = {
  current: {},
  history: [],
};

export const contextSlice = createSlice({
  name: "context",
  initialState,
  reducers: {
    setMaterialContext: (state, action: PayloadAction<Partial<MaterialContext>>) => {
      state.current = {
        ...state.current,
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
      // Keep lightweight history of past 5 contexts
      if (action.payload.hsCode) {
        state.history = [
          state.current,
          ...state.history.filter((h) => h.hsCode !== action.payload.hsCode),
        ].slice(0, 5);
      }
    },
    updateContextField: <K extends keyof MaterialContext>(
      state: ContextState,
      action: PayloadAction<{ field: K; value: MaterialContext[K] }>
    ) => {
      state.current[action.payload.field] = action.payload.value;
      state.current.lastUpdated = new Date().toISOString();
    },
    clearMaterialContext: (state) => {
      state.current = {};
    },
  },
});

export const { setMaterialContext, updateContextField, clearMaterialContext } =
  contextSlice.actions;

export default contextSlice.reducer;
