"use client";
import DarkModeButton from "@/ui/block/DarkModeButton/DarkModeButton";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setToggle } from "@/redux/features/sideBarSlice/sideBarSlice";
import { setScrapeToggle } from "@/redux/features/ScrapeModul/scrapeModul";

export default function NavBar({ isDashboard }) {
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(setToggle());
  };
  const handleScrapeToggle = () => {
    dispatch(setScrapeToggle());
  };
  return (
    <div className="bg-input-bg dark:bg-dark-input-bg flex flex-row items-center justify-between border-b border-input-border dark:border-dark-input-border px-16 rounded-t-main min-w-full max-w-full w-full min-h-[60px] h-[60px] max-h-[60px]">
      <div className="flex flex-row gap-8 items-center">
        {!isDashboard && (
          <motion.button
            className="px-8 bg-white dark:bg-primary border border-input-border dark:border-dark-input-border rounded-main h-40 w-40 flex lg:hidden items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggle}
          >
            <Bars3Icon className="h-24 w-24 text-primary dark:text-input-bg" />
          </motion.button>
        )}

        <DarkModeButton />
        {isDashboard && (
          <Link
            className="bg-white dark:bg-primary border border-input-border dark:border-dark-input-border h-40 rounded-main px-16 flex items-center"
            href="/"
          >
            <p className="text-md text-primary dark:text-input-bg">
              Go to Chat
            </p>
          </Link>
        )}
      </div>
      <motion.div
        className="bg-white dark:bg-primary border border-input-border dark:border-dark-input-border h-40 rounded-main px-16 flex items-center cursor-pointer hover:bg-opacity-90 shadow-sm"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleScrapeToggle}
      >
        <p className="text-md text-primary dark:text-input-bg">
          Scrape Website
        </p>
      </motion.div>
    </div>
  );
}
