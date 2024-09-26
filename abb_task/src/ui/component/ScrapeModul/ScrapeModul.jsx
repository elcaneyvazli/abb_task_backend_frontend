import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { scrapeWebsite } from "@/redux/features/ScrapeSlice/ScrapeSlice";
import { setScrapeToggle } from "@/redux/features/ScrapeModul/scrapeModul";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ScrapeModul() {
  const dispatch = useDispatch();
  const { status, error, scrapedFilename, scrapedContent } = useAppSelector(
    (state) => state.scrape
  );
  const { toggle } = useAppSelector((state) => state.scrapeModul);
  const [url, setUrl] = useState("");

  const onClose = () => {
    dispatch(setScrapeToggle());
  };

  const handleScrape = () => {
    dispatch(scrapeWebsite(url));
  };

  const getErrorMessage = () => {
    if (typeof error === "string") return error;
    if (error && error.message) return error.message;
    return "An unknown error occurred";
  };

  return toggle ? (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-20 dark:bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      ></motion.div>
      <motion.div
        className="bg-white dark:bg-primary px-32 py-12 rounded-lg shadow-xl z-50 min-h-full md:min-h-fit w-full md:w-[70%] flex flex-col gap-12 max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, rotate: 5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-medium text-primary dark:text-input-bg">
            Web Scrape
          </h1>
          <XMarkIcon
            className="w-24 h-24 text-primary dark:text-input-bg"
            onClick={onClose}
          />
        </div>

        <div className="flex flex-row items-center justify-between px-12 w-full h-48 bg-input-bg dark:bg-dark-input-bg border border-input-border dark:border-dark-input-border rounded-main">
          <input
            className="focus:ring-0 focus:border-none focus:outline-none bg-transparent text-md font-normal text-primary dark:text-input-bg w-full resize-none overflow-hidden"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scrape"
          />
          <motion.button
            className={`flex-shrink-0 w-40 h-40 flex items-center justify-center bg-primary border border-dark-input-border rounded-full cursor-pointer}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            onClick={handleScrape}
            disabled={status === "loading"}
          >
            <PaperAirplaneIcon
              className={`w-24 h-24 text-input-bg dark:text-input-bg}`}
            />
          </motion.button>
        </div>
        {status === "loading" && (
          <p className="text-primary dark:text-input-bg">Loading...</p>
        )}
        {status === "failed" && error && (
          <p className="text-red-500 text-md">{getErrorMessage()}</p>
        )}
        {status === "succeeded" && scrapedFilename && (
          <div>
            <p className="text-green-500 text-md mb-4">
              Scraping successful! Filename: {scrapedFilename}
            </p>
            <h2 className="text-lg font-medium text-primary dark:text-input-bg mb-2">
              Scraped Content Preview:
            </h2>
            <div className="bg-input-bg dark:bg-dark-input-bg p-16 h-full md:h-[500px] overflow-y-auto rounded-md text-primary dark:text-input-bg border border-input-border dark:border-dark-input-border shadow-sm">
              {scrapedContent ? scrapedContent : "No content available"}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  ) : null;
}
