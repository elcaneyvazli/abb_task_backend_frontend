"use client";
import React from "react";
import Logo from "@/ui/asserts/logo.svg";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedAnswer,
  clearSelectedAnswer,
  deleteChat,
} from "@/redux/features/answerSlice/answerSlice";
import { motion } from "framer-motion";
import {
  ChatBubbleBottomCenterTextIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { setToggle } from "@/redux/features/sideBarSlice/sideBarSlice";

export default function SideBar() {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.answer.chats);
  const selectedAnswerId = useSelector((state) => state.answer.selectedAnswer);
  const toggleSidebar = useSelector((state) => state.sideBar.toggle);

  console.log("toggleSidebar", toggleSidebar);

  const handleLinkClick = (id) => {
    dispatch(setSelectedAnswer(id));
  };

  const handleNewTabClick = () => {
    dispatch(clearSelectedAnswer());
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation();
    dispatch(deleteChat(id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDisplayText = (chat) => {
    if (chat.messages.length === 0) return "New Chat";
    const assistantMessage = chat.messages.find(
      (msg) => msg.type === "assistant"
    );
    if (assistantMessage) return assistantMessage.text;
    return chat.messages[0].text;
  };

  const handleToggle = () => {
    dispatch(setToggle());
  };

  return (
    <motion.div
      className={`
         w-full lg:w-[250px] h-screen bg-white dark:bg-primary flex flex-col justify-between px-16 py-16 gap-16 overflow-hidden
        lg:flex z-[9999]
        ${toggleSidebar ? "fixed top-0 left-0 z-[9999] pointer-events-auto" : "hidden"}
      `}
    >
      <div className="flex flex-col gap-64 h-full overflow-y-auto">
        <div className="flex flex-row items-center justify-between gap-16">
          <div className="flex flex-row items-center gap-16">
            <div className="flex h-40 w-40">
              <Image src={Logo} alt="Logo" width={40} height={40} />
            </div>
            <h1 className="text-2xl font-bold text-primary dark:text-input-bg whitespace-nowrap">
              Horizon Ai
            </h1>
          </div>
          <motion.button
            className="px-8 bg-input-bg dark:bg-dark-input-bg border border-input-border dark:border-dark-input-border rounded-main h-40 w-40 flex lg:hidden items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggle}
          >
            <XMarkIcon className="h-24 w-24 text-primary dark:text-input-bg" />
          </motion.button>
        </div>
        <div className="flex flex-col gap-12 items-start  min-h-full h-full max-h-full overflow-hidden">
          <motion.button
            key="new-chat"
            className="px-16 p-8 h-40 bg-input-bg dark:bg-dark-input-bg border border-input-border dark:border-dark-input-border w-full rounded-main flex flex-row items-center gap-8 hover:opacity-90 whitespace-nowrap"
            whileTap={{ scale: 0.95 }}
            onClick={handleNewTabClick}
          >
            <ChatBubbleBottomCenterTextIcon className="w-24 h-24 text-primary dark:text-input-bg" />
            <p className="text-start text-md text-primary dark:text-input-bg w-full">
              New Chat
            </p>
          </motion.button>
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              onClick={() => handleLinkClick(chat.id)}
              className={`flex flex-row items-center justify-between rounded-main w-full px-8 cursor-pointer hover:bg-input-bg hover:dark:bg-dark-input-bg hover:border hover:border-input-border hover:dark:border-dark-input-border py-4  ${
                selectedAnswerId === chat.id
                  ? "bg-input-bg dark:bg-dark-input-bg border border-input-border dark:border-dark-input-border"
                  : ""
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col gap-2 overflow-hidden">
                <p className="line-clamp-1 text-md text-primary dark:text-input-bg w-full ">
                  {getDisplayText(chat)}
                </p>
                <p className="text-xs text-light dark:text-light">
                  {chat.messages.length > 0
                    ? formatDate(chat.messages[0].timestamp)
                    : ""}
                </p>
              </div>
              <motion.button
                onClick={(e) => handleDeleteChat(e, chat.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-light hover:text-red-500 dark:hover:text-red-400"
              >
                <TrashIcon className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
      <Link
        className="bg-input-bg dark:bg-dark-input-bg border border-input-border dark:border-dark-input-border min-h-40 rounded-main px-16 flex items-center"
        href="/dashboard"
      >
        <p className="text-md text-primary dark:text-input-bg whitespace-nowrap">
          Go to Dashboard
        </p>
      </Link>
    </motion.div>
  );
}
