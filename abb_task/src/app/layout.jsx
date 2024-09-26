"use client";
import React, { useState, useEffect } from "react";
import SideBar from "@/ui/layout/SideBar/SideBar";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "@/redux/provider";
import AskInput from "@/ui/layout/AskInput/AskInput";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/ui/layout/NavBar/NavBar";
import { usePathname } from "next/navigation";
import useScreenWidth from "@/utils/useScreen";
import { useAppSelector } from "@/redux/store";
import ScrapeModul from "@/ui/component/ScrapeModul/ScrapeModul";

function LayoutContent({ children }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname.includes("dashboard");
  const toggleSidebar = useAppSelector((state) => state.sideBar.toggle);

  useEffect(() => {
    setMounted(true);
  }, []);

  const screenSize = useScreenWidth(1024);

  if (!mounted) {
    return null;
  }

  const sidebarVisible = !isDashboard && !screenSize;
  const sidebarWidth = sidebarVisible ? "250px" : "0";

  return (
    <div className="flex flex-row gap-0 w-full h-screen">
      <motion.div
        initial={{ width: 0 }}
        animate={{
          width: toggleSidebar || sidebarVisible ? "250px" : "0",
          position: screenSize && toggleSidebar ? "absolute" : "relative",
          minWidth: screenSize && toggleSidebar ? "250px" : "0",
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`
          bg-white dark:bg-primary h-screen min-h-screen max-h-screen z-50 flex items-center
          ${screenSize ? "fixed top-0 left-0 z-50" : "absolute"}
          ${toggleSidebar || sidebarVisible ? "flex" : "hidden"}
          ${sidebarVisible ? "" : "pointer-events-none"}
        `}
      >
        <AnimatePresence>
          {(toggleSidebar || sidebarVisible) && <SideBar />}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ width: "100%" }}
        animate={{
          width: `calc(100% - ${sidebarWidth}px)`,
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <motion.div
          className="rounded-main px-8 py-12 bg-white dark:bg-primary h-screen min-h-screen max-h-screen w-full"
          layout
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.div
            className="bg-input-bg dark:bg-dark-input-bg border border-input-border dark:border-dark-input-border flex flex-col rounded-main max-h-full min-h-full relative w-full"
            layout
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <NavBar isDashboard={isDashboard} />
            <motion.div
              className="w-full h-full min-h-[calc(100vh-104px)] max-w-full max-h-full overflow-y-auto"
              layout
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
            {!isDashboard && <AskInput />}
          </motion.div>
        </motion.div>
      </motion.div>
      <ScrapeModul />
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="flex flex-row bg-white dark:bg-primary overflow-hidden">
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
          >
            <LayoutContent>{children}</LayoutContent>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}


