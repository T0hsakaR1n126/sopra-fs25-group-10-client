import { createSlice } from "@reduxjs/toolkit";

const heartbeatSlice = createSlice({
  name: "heartbeat",
  initialState: {
    enabled: false,
  },
  reducers: {
    enableHeartbeat: (state) => {
      state.enabled = true;
    },
    disableHeartbeat: (state) => {
      state.enabled = false;
    },
  },
});

export const { enableHeartbeat, disableHeartbeat } = heartbeatSlice.actions;
export default heartbeatSlice.reducer;
