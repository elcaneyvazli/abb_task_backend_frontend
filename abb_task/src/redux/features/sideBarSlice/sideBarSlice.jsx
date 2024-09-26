import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toggle: false,
};

const sideBarSlice = createSlice({
  name: "sideBar",
  initialState,
  reducers: {
    setToggle: (state) => {
      state.toggle = !state.toggle;
    },
  },
});

export const { setToggle } = sideBarSlice.actions;

export default sideBarSlice.reducer;
