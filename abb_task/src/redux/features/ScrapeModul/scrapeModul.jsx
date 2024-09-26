import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toggle: false,
};

const scrapeModulSlice = createSlice({
  name: "scrapeModul",
  initialState,
  reducers: {
    setScrapeToggle: (state) => {
      state.toggle = !state.toggle;
    },
  },
});

export const { setScrapeToggle } = scrapeModulSlice.actions;

export default scrapeModulSlice.reducer;
