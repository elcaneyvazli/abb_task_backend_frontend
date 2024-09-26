import { configureStore } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import answerSlice from "./features/answerSlice/answerSlice";
import sideBarSlice from "./features/sideBarSlice/sideBarSlice";
import scrapeModulSlice from "./features/ScrapeModul/scrapeModul";
import ScrapeSlice from "./features/ScrapeSlice/ScrapeSlice";

export const store = configureStore({
  reducer: {
    answer: answerSlice,
    sideBar: sideBarSlice,
    scrapeModul: scrapeModulSlice,
    scrape: ScrapeSlice,
  },
});

export const useAppSelector = useSelector;
