import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_KEY;

export const scrapeWebsite = createAsyncThunk(
  "scrape/scrapeWebsite",
  async (url, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/scrape`, { url });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const scrapeSlice = createSlice({
  name: "scrape",
  initialState: {
    toggle: false,
    status: "idle",
    error: null,
    scrapedFilename: null,
    scrapedContent: null,
  },
  reducers: {
    setScrapeToggle: (state) => {
      state.toggle = !state.toggle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scrapeWebsite.pending, (state) => {
        state.status = "loading";
      })
      .addCase(scrapeWebsite.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.scrapedFilename = action.payload.filename;
        state.scrapedContent = action.payload.content;
      })
      .addCase(scrapeWebsite.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setScrapeToggle } = scrapeSlice.actions;

export default scrapeSlice.reducer;