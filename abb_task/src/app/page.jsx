"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  setSelectedAnswer,
  setMessageLike,
} from "@/redux/features/answerSlice/answerSlice";
import Image from "next/image";
import Empty from "@/ui/asserts/empty.svg";
import {
  HandThumbDownIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";

const MessageSkeleton = () => (
  <div className="animate-pulse flex w-full justify-start">
    <div className="w-[80%] bg-white dark:bg-primary rounded-main p-16 mr-auto">
      <div className="h-12 bg-light dark:bg-light rounded w-full mb-2"></div>
      <div className="h-12 bg-light dark:bg-light rounded w-1/2"></div>
    </div>
  </div>
);

export default function Home() {
  const dispatch = useDispatch();
  const selectedAnswerId = useAppSelector(
    (state) => state.answer.selectedAnswer
  );
  const statusAnswer = useAppSelector((state) => state.answer.status);
  const chats = useAppSelector((state) => state.answer.chats);
  const messageLikes = useAppSelector((state) => state.answer.messageLikes);
  const messagesEndRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setIsClient(true);
    if (chats.length > 0 && !selectedAnswerId) {
      dispatch(setSelectedAnswer(chats[chats.length - 1].id));
    }
  }, [dispatch, chats, selectedAnswerId]);

  useEffect(() => {
    scrollToBottom();
  }, [chats, statusAnswer, scrollToBottom]);

  const handleLike = useCallback((messageId) => {
    const currentLikeState = messageLikes[messageId] || {
      liked: false,
      disliked: false,
    };
    dispatch(
      setMessageLike({
        messageId,
        liked: !currentLikeState.liked,
        disliked: false,
      })
    );
  }, [dispatch, messageLikes]);

  const handleDislike = useCallback((messageId) => {
    const currentLikeState = messageLikes[messageId] || {
      liked: false,
      disliked: false,
    };
    dispatch(
      setMessageLike({
        messageId,
        liked: false,
        disliked: !currentLikeState.disliked,
      })
    );
  }, [dispatch, messageLikes]);

  const selectedChat = chats.find((chat) => chat.id === selectedAnswerId);

  const renderMessage = useCallback((message) => {
    const isUser = message.type !== "assistant";

    const messageTimestamp = message.timestamp || new Date().toISOString();
    const messageText = message.text || "Message text missing";

    const messageId = `${messageTimestamp}-${messageText.substring(0, 10)}`;

    const likeState =
      messageLikes && messageLikes[messageId]
        ? messageLikes[messageId]
        : {
            liked: false,
            disliked: false,
          };

    return (
      <div
        key={messageId}
        className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`w-[100%] lg:w-[80%] bg-white dark:bg-primary rounded-main p-16 border border-input-border dark:border-dark-input-border flex flex-col gap-8 ${
            isUser ? "bg-blue-100 ml-auto" : "mr-auto"
          }`}
        >
          <h1 className="text-md text-primary dark:text-input-bg font-medium text-start">
            {messageText}
          </h1>
          {!isUser && (
            <div className="flex flex-row items-center gap-16 mt-2">
              <button
                onClick={() => handleLike(messageId)}
                className={`flex flex-row gap-8 items-center ${
                  likeState.liked ? "text-blue-500" : ""
                }`}
              >
                <HandThumbUpIcon
                  className={`h-16 w-16 ${
                    likeState.liked ? "text-blue-500" : "text-light"
                  }`}
                />
                <p
                  className={`text-md ${
                    likeState.liked ? "text-blue-500" : "text-light"
                  }`}
                >
                  Like
                </p>
              </button>
              <button
                onClick={() => handleDislike(messageId)}
                className={`flex flex-row gap-8 items-center ${
                  likeState.disliked ? "text-red-500" : ""
                }`}
              >
                <HandThumbDownIcon
                  className={`h-16 w-16 ${
                    likeState.disliked ? "text-red-500" : "text-light"
                  }`}
                />
                <p
                  className={`text-md ${
                    likeState.disliked ? "text-red-500" : "text-light"
                  }`}
                >
                  Dislike
                </p>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }, [handleLike, handleDislike, messageLikes]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-full text-4xl min-h-[calc(100vh-24px)] overflow-y-auto">
      {selectedChat ? (
        <div className="flex flex-col gap-16 min-h-full px-32 lg:px-80 py-16 pb-80">
          {selectedChat.messages.map(renderMessage)}
          {statusAnswer === "loading" && <MessageSkeleton />}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex flex-col gap-32 items-center justify-center min-h-[calc(100vh-24px)]">
          <Image src={Empty} alt="logo" width={300} height={300} />
          <h1 className="text-xl text-light">
            Lütfen kenar çubuğundan bir yanıt seçin veya yeni bir soru yazın
          </h1>
        </div>
      )}
    </div>
  );
}