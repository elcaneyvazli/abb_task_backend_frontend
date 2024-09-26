import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_KEY;

const loadState = () => {
  try {
    const serializedState = localStorage.getItem("chatState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("chatState", serializedState);
  } catch {}
};

const loadMessageLikes = () => {
  try {
    const storedLikes = localStorage.getItem("messageLikes");
    return storedLikes ? JSON.parse(storedLikes) : {};
  } catch {
    return {};
  }
};

const saveMessageLikes = (likes) => {
  try {
    localStorage.setItem("messageLikes", JSON.stringify(likes));
  } catch {}
};

const initialState = loadState() || {
  selectedAnswer: null,
  answers: [],
  userMessages: [],
  chats: [],
  status: "idle",
  error: null,
  messageLikes: loadMessageLikes(), // Load messageLikes
};

export const askQuestion = createAsyncThunk(
  "answer/askQuestion",
  async ({ content, filename }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/ask`, {
        content,
        filename,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadFile = createAsyncThunk(
  "answer/uploadFile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const answerSlice = createSlice({
  name: "answer",
  initialState,
  reducers: {
    setSelectedAnswer: (state, action) => {
      state.selectedAnswer = action.payload;
    },
    clearSelectedAnswer: (state) => {
      const newChat = {
        id: Date.now().toString(),
        messages: [],
      };
      state.chats.unshift(newChat);
      state.selectedAnswer = newChat.id;
      saveState(state);
    },
    addAnswer: (state, action) => {
      const newChat = {
        id: Date.now().toString(),
        messages: [
          {
            type: "user",
            text: state.userMessages[state.userMessages.length - 1].text,
          },
          { type: "assistant", text: action.payload.text },
        ],
      };
      state.chats.push(newChat);
      state.answers.push(action.payload);
      state.selectedAnswer = newChat.id;
      saveState(state);
    },
    addUserMessage: (state, action) => {
      const newMessage = {
        ...action.payload,
        type: "user",
        timestamp: new Date().toISOString(),
      };
      const chatIndex = state.chats.findIndex(
        (chat) => chat.id === state.selectedAnswer
      );
      if (chatIndex !== -1) {
        state.chats[chatIndex].messages.push(newMessage);
      } else {
        const newChat = {
          id: Date.now().toString(),
          messages: [newMessage],
        };
        state.chats.unshift(newChat);
        state.selectedAnswer = newChat.id;
      }
      state.userMessages.push(newMessage);
      saveState(state);
    },
    deleteChat: (state, action) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);
      if (state.selectedAnswer === action.payload) {
        state.selectedAnswer =
          state.chats.length > 0 ? state.chats[0].id : null;
      }
      saveState(state);
    },
    setMessageLike: (state, action) => {
      const { messageId, liked, disliked } = action.payload;
      state.messageLikes[messageId] = { liked, disliked };
      saveMessageLikes(state.messageLikes); // Persist likes to localStorage
      saveState(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(askQuestion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(askQuestion.fulfilled, (state, action) => {
        state.status = "succeeded";
        const chatIndex = state.chats.findIndex(
          (chat) => chat.id === state.selectedAnswer
        );
        if (chatIndex !== -1) {
          state.chats[chatIndex].messages.push({
            type: "assistant",
            text: action.payload.answer,
            timestamp: new Date().toISOString(),
          });
        }
        state.answers.push({
          ...action.payload,
          timestamp: new Date().toISOString(),
        });
        saveState(state);
      })
      .addCase(askQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(uploadFile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedAnswer,
  clearSelectedAnswer,
  addAnswer,
  addUserMessage,
  deleteChat,
  setMessageLike,
} = answerSlice.actions;

export default answerSlice.reducer;
