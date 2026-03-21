import axiosInstance from "../../axiosConfig";
import { showLoading, closeLoading } from "../../swalConfig";

// Base URL for chat API
const BASE_URL = "/seller/chat";

// Chat participant interfaces
export interface ChatAdmin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface ChatSeller {
  id: string;
  firm_name: string;
  email: string;
  phone: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Message interface
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderType: "admin" | "seller";
  content: string;
  fileUrl:
    | string
    | {
        url: string;
        fileName: string;
        fileSize: number;
        fileType: string;
        uploadedAt: string;
      }
    | null;
  createdAt: string;
  updatedAt: string;
  sender?: ChatParticipant;
  receiver?: ChatParticipant;
}

// Chat interface
export interface Chat {
  id: string;
  adminId: string;
  sellerId: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  Admin: ChatAdmin;
  Seller: ChatSeller;
  Messages: {
    id: string;
    content: string;
    createdAt: string;
  }[];
}

// Message request interface
export interface SendMessageRequest {
  chatId?: string;
  senderId: string;
  senderType: "admin" | "seller";
  receiverId?: string; // Required when creating a new chat
  receiverType?: "admin" | "seller"; // Required when creating a new chat
  content: string;
  file?: File;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Start a chat with admin
export const startChat = async (sellerId: string): Promise<Chat | null> => {
  try {
    // showLoading("Starting chat with admin...");
    const response = await axiosInstance.post<ApiResponse<Chat>>(
      `${BASE_URL}/start-chat/${sellerId}`
    );
    closeLoading();

    // Check if the response contains the expected data
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error("Invalid response format:", response.data);
      return null;
    }
  } catch (error: unknown) {
    closeLoading();
    // Check for specific error responses
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      console.error("API Error:", axiosError.response.data.message);
    } else {
      console.error("Error starting chat:", error);
    }
    return null;
  }
};

// Get all chats for seller
export const getAllChats = async (
  senderId: string,
  senderType: "admin" | "seller"
): Promise<Chat[]> => {
  try {
    // showLoading("Loading chats...");
    const response = await axiosInstance.get<ApiResponse<Chat[]>>(
      `${BASE_URL}/get-chats`,
      {
        params: {
          senderId,
          senderType,
        },
      }
    );
    closeLoading();
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error("Invalid response format for chats:", response.data);
      return [];
    }
  } catch (error: unknown) {
    closeLoading();
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      console.error("API Error:", axiosError.response.data.message);
    } else {
      console.error("Error fetching chats:", error);
    }
    return [];
  }
};

// Get messages for a specific chat
export const getChatMessages = async (
  chatId: string,
  senderId: string,
  senderType: "admin" | "seller"
): Promise<ChatMessage[]> => {
  try {
    // showLoading("Loading messages...");
    const response = await axiosInstance.get<ApiResponse<ChatMessage[]>>(
      `${BASE_URL}/get-messages/${chatId}`,
      {
        params: {
          senderId,
          senderType,
        },
      }
    );
    closeLoading();
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error("Invalid response format for messages:", response.data);
      return [];
    }
  } catch (error: unknown) {
    closeLoading();
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      console.error("API Error:", axiosError.response.data.message);
    } else {
      console.error("Error fetching messages:", error);
    }
    return [];
  }
};

// Send a message in a chat
export const sendMessage = async (
  messageData: SendMessageRequest
): Promise<ChatMessage | null> => {
  try {
    if (messageData.file) {
      const formData = new FormData();
      if (messageData.chatId) formData.append("chatId", messageData.chatId);
      formData.append("senderId", messageData.senderId);
      formData.append("senderType", messageData.senderType);
      if (messageData.receiverId)
        formData.append("receiverId", messageData.receiverId);
      if (messageData.receiverType)
        formData.append("receiverType", messageData.receiverType);
      formData.append("content", messageData.content);
      formData.append("file", messageData.file);

      const response = await axiosInstance.post<ApiResponse<ChatMessage>>(
        `${BASE_URL}/send-message`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.error(
          "Invalid response format for send message:",
          response.data
        );
        return null;
      }
    } else {
      // Regular JSON request without file
      const response = await axiosInstance.post<ApiResponse<ChatMessage>>(
        `${BASE_URL}/send-message`,
        messageData
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.error(
          "Invalid response format for send message:",
          response.data
        );
        return null;
      }
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      console.error("API Error:", axiosError.response.data.message);
    } else {
      console.error("Error sending message:", error);
    }
    return null;
  }
};
