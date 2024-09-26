"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  SunIcon,
  MoonIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function DarkModeButton() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="px-8 bg-white dark:bg-primary border border-input-border dark:border-dark-input-border rounded-main h-40 w-40 flex items-center justify-center animate-pulse">
        <EllipsisHorizontalIcon className="h-24 w-24 text-gray-800 dark:text-white" />
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="px-8 bg-white dark:bg-primary border border-input-border dark:border-dark-input-border rounded-main h-40 w-40 flex items-center justify-center"
    >
      {resolvedTheme === "dark" ? (
        <MoonIcon className="h-24 w-24 text-gray-800 dark:text-white" />
      ) : (
        <SunIcon className="h-24 w-24 text-gray-800 dark:text-white" />
      )}
    </motion.button>
  );
}
