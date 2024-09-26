"use client";
import { PaperAirplaneIcon, PaperClipIcon, XCircleIcon } from "@heroicons/react/24/outline";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  addUserMessage,
  askQuestion,
  uploadFile,
} from "@/redux/features/answerSlice/answerSlice";

export default function AskInput() {
  const [inputValue, setInputValue] = useState("");
  const [isMultiline, setIsMultiline] = useState(false);
  const textareaRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const status = useSelector((state) => state.answer.status);
  const selectedAnswerId = useSelector((state) => state.answer.selectedAnswer);

  useEffect(() => {
    const storedFileName = localStorage.getItem(`fileName_${selectedAnswerId}`);
    if (storedFileName) {
      setFileName(storedFileName);
    }
  }, [selectedAnswerId]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
      setIsMultiline(scrollHeight > 40);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError("");
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      localStorage.setItem(`fileName_${selectedAnswerId}`, file.name);
      setError("");

      setIsFileUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        await dispatch(uploadFile(formData));
        console.log("File uploaded successfully");
      } catch (error) {
        console.error("Error uploading file:", error);
        setError("Failed to upload file. Please try again.");
      } finally {
        setIsFileUploading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName("");
    localStorage.removeItem(`fileName_${selectedAnswerId}`);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fileName) {
      setError("Please select a file.");
      return;
    }

    if (!inputValue.trim()) {
      setError("Please enter a message.");
      return;
    }

    if (status === "loading" || isFileUploading) return;

    try {
      setIsSubmitting(true);

      dispatch(
        addUserMessage({
          id: Date.now().toString(),
          text: inputValue.trim(),
        })
      );

      await dispatch(
        askQuestion({ content: inputValue.trim(), filename: fileName })
      );

      setInputValue("");
    } catch (error) {
      console.error("Error during submission:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isSubmitDisabled =
    !fileName || !inputValue.trim() || isSubmitting || isFileUploading;

  const FileUploadButton = () => (
    <motion.button
      type="button"
      onClick={() => fileName ? handleRemoveFile() : fileInputRef.current.click()}
      className="relative flex-shrink-0 w-40 h-40 flex items-center justify-center bg-dark-input-border border border-dark-input-border rounded-full cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {fileName ? (
        <>
          <XCircleIcon className="w-24 h-24 text-red-500" />
          <span className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 text-[10px] text-input-bg whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[150px]">
            {fileName}
          </span>
        </>
      ) : (
        <PaperClipIcon className="w-24 h-24 text-input-bg" />
      )}
    </motion.button>
  );

  return (
    <div className="relative">
      <motion.form
        className="absolute bottom-16 left-[50%] w-[95%] lg:w-[70%] bg-primary dark:bg-dark-primary flex items-center justify-between py-8 px-8 shadow-2x border border-dark-input-border"
        style={{
          transform: "translateX(-50%)",
          borderRadius: isMultiline ? "10px" : "9999px",
        }}
        initial={{ borderRadius: "9999px" }}
        animate={{
          borderRadius: isMultiline ? "10px" : "9999px",
        }}
        transition={{ duration: 0.2 }}
        onSubmit={handleSubmit}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <FileUploadButton />
        <div className="flex-grow mx-4">
          <textarea
            ref={textareaRef}
            className="focus:ring-0 focus:border-none focus:outline-none bg-transparent text-md font-normal text-input-bg w-full resize-none overflow-hidden"
            placeholder="Type a message"
            rows={1}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{
              minHeight: "1.5rem",
              maxHeight: "5rem",
              verticalAlign: "middle",
            }}
          />
        </div>
        <motion.button
          className={`flex-shrink-0 w-40 h-40 flex items-center justify-center bg-dark-input-border border border-dark-input-border rounded-full ${
            isSubmitDisabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
          whileHover={{ scale: isSubmitDisabled ? 1 : 1.1 }}
          whileTap={{ scale: isSubmitDisabled ? 1 : 0.9 }}
          type="submit"
          disabled={isSubmitDisabled}
        >
          <PaperAirplaneIcon
            className={`w-24 h-24 ${
              isSubmitDisabled ? "text-gray-400" : "text-input-bg"
            }`}
          />
        </motion.button>
      </motion.form>
      {error && (
        <div className="absolute bottom-0 left-[50%] transform -translate-x-1/2 text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
}