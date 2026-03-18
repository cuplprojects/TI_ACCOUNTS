"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faPaperPlane,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAllChats,
  getChatMessages,
  sendMessage,
  Chat,
  ChatMessage,
} from "@/app/lib/services/admin/chatService";
import { getAllSellers, Seller } from "@/app/lib/services/admin/sellerService";
import { showErrorMessage } from "@/app/lib/swalConfig";
import { Avatar } from "@/app/components/common/Avatar";
import { getCurrentUser } from "@/app/lib/utils";
import { v4 as uuidv4 } from "uuid";

// Extend ChatMessage type for local UI state
interface LocalChatMessage extends ChatMessage {
  pending?: boolean;
  failed?: boolean;
}

export default function ChatPage() {
  const { setTitle } = usePageTitle();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatMessages, setChatMessages] = useState<LocalChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [newChatMessage, setNewChatMessage] = useState("");

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get admin ID from localStorage
  const currentUser = getCurrentUser();
  const USER_TYPE: "admin" | "seller" = "admin";

  useEffect(() => {
    setTitle("Chats");
    if (!currentUser) {
      showErrorMessage("User information not found. Please login again.");
      return;
    }
    fetchChats();
    fetchSellers();
  }, [setTitle]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Fetch all chats
  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const chatsData = await getAllChats(currentUser?.id || "", USER_TYPE);
      setChats(chatsData);

      // Select the first chat if available and none is currently selected
      if (chatsData.length > 0 && !selectedChat) {
        setSelectedChat(chatsData[0].id);
        fetchChatMessages(chatsData[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setIsLoading(false);
    }
  };

  // Fetch all sellers for new chat dropdown
  const fetchSellers = async () => {
    try {
      const sellersResponse = await getAllSellers({ limit: 100 }); // Get more sellers for dropdown
      setSellers(sellersResponse.sellers);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  // Fetch messages for a specific chat
  const fetchChatMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      const messagesData = await getChatMessages(
        chatId,
        currentUser?.id || "",
        USER_TYPE
      );
      setChatMessages(messagesData);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    if (chatId !== selectedChat) {
      setSelectedChat(chatId);
      fetchChatMessages(chatId);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Check if file is an image
  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

  // Create a new chat with selected seller
  const handleCreateNewChat = async () => {
    if (!selectedSeller) {
      showErrorMessage("Please select a seller to start a chat with.");
      return;
    }
    if (!newChatMessage.trim()) {
      showErrorMessage("Please type a message to start the chat.");
      return;
    }
    if (!currentUser?.id) {
      showErrorMessage("Admin information not found. Please login again.");
      return;
    }
    try {
      // Send the user's message as the first message to create the chat
      const newMessage = await sendMessage({
        senderId: currentUser.id,
        senderType: USER_TYPE,
        receiverId: selectedSeller,
        receiverType: "seller",
        content: newChatMessage.trim(),
      });
      if (newMessage && newMessage.chatId) {
        // Refresh chats to include the new one
        await fetchChats();
        // Select the new chat
        setSelectedChat(newMessage.chatId);
        fetchChatMessages(newMessage.chatId);
        // Reset UI state
        setSelectedSeller(null);
        setNewChatMessage("");
        setShowNewChatDropdown(false);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      showErrorMessage("Failed to create new chat. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if ((message.trim() || selectedFile) && selectedChat) {
      const tempId = uuidv4();
      const pendingMsg: LocalChatMessage = {
        id: tempId,
        chatId: selectedChat,
        senderId: currentUser?.id || "",
        senderType: USER_TYPE,
        content: message.trim(),
        fileUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pending: true,
      };
      setChatMessages((prev) => [...prev, pendingMsg]);
      setMessage("");
      const currentSelectedFile = selectedFile;
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      try {
        const messageData = {
          chatId: selectedChat,
          content: pendingMsg.content,
          senderId: currentUser?.id || "",
          senderType: USER_TYPE,
          file: currentSelectedFile || undefined,
        };
        const newMessage = await sendMessage(messageData);
        if (newMessage) {
          setChatMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? { ...newMessage } : msg))
          );

          // Update the chat list to show the latest message
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === selectedChat
                ? {
                    ...chat,
                    Messages: [...(chat.Messages || []), newMessage],
                  }
                : chat
            )
          );
        } else {
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, pending: false, failed: true } : msg
            )
          );
        }
      } catch {
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, pending: false, failed: true } : msg
          )
        );
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter chats based on search term
  const filteredChats = chats.filter((chat) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      chat.Seller.firm_name.toLowerCase().includes(searchLower) ||
      (chat.Messages &&
        chat.Messages.length > 0 &&
        chat.Messages[chat.Messages.length - 1].content
          .toLowerCase()
          .includes(searchLower))
    );
  });

  // Get the selected chat details
  const selectedChatDetails = selectedChat
    ? chats.find((chat) => chat.id === selectedChat)
    : null;

  // Helper function to strip HTML tags for chat preview
  const stripHtmlTags = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Format timestamp for chat list
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      // If the message is from today, show the time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.getDate() === today.getDate() - 1) {
      // If the message is from yesterday
      return "Yesterday";
    } else {
      // Otherwise show short date
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: LocalChatMessage[]) => {
    const groups: { [key: string]: LocalChatMessage[] } = {};

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      const dateKey = messageDate.toDateString(); // This gives us a unique key per date

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  // Format date for display (like "9 Jun 2025")
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-blue-80 rounded-md">
      {/* Sidebar / Chat List */}
      <div className="w-80 border-r border-gray-line flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-line">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-8 rounded-md border border-gray-line text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Image
                src="/images/common/header/search.png"
                alt="Search"
                width={14}
                height={14}
                className="h-3 w-3 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Contact List - with flex-1 to allow for the new chat button at bottom */}
        <div className="overflow-y-auto flex-1">
          {isLoading && chats.length === 0 ? (
            // Skeleton loader - maintains chat list structure
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="p-4 border-b border-gray-line animate-pulse">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "No chats match your search" : "No chats found"}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const lastMessage =
                chat.Messages && chat.Messages.length > 0
                  ? chat.Messages[chat.Messages.length - 1]
                  : null;

              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`p-4 border-b border-gray-line cursor-pointer ${
                    selectedChat === chat.id ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <Avatar
                        name={chat.Seller.firm_name}
                        className="h-10 w-10 text-sm"
                      />
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.Seller.firm_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {lastMessage
                            ? formatTimestamp(lastMessage.createdAt)
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {lastMessage
                          ? stripHtmlTags(lastMessage.content)
                          : "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-t border-gray-line">
          {showNewChatDropdown ? (
            <div className="space-y-3">
              <select
                value={selectedSeller || ""}
                onChange={(e) => setSelectedSeller(e.target.value)}
                className="w-full p-2 border border-gray-line rounded-md text-sm focus:outline-none"
              >
                <option value="">Select a seller</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.firmName} ({seller.email})
                  </option>
                ))}
              </select>
              <textarea
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                className="w-full p-2 border border-gray-line rounded-md text-sm resize-none focus:outline-none"
                placeholder="Type your message to start the chat..."
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateNewChat}
                  className="flex-1 py-2 bg-blue-00 text-white text-sm rounded-md hover:bg-blue-700"
                  disabled={!selectedSeller || !newChatMessage.trim()}
                >
                  Start Chat
                </button>
                <button
                  onClick={() => {
                    setShowNewChatDropdown(false);
                    setSelectedSeller(null);
                    setNewChatMessage("");
                  }}
                  className="flex-1 py-2 border border-gray-line text-sm rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewChatDropdown(true)}
              className="w-full py-2 px-4 flex items-center justify-center gap-2 bg-blue-00 text-white rounded-md hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              <span className="whitespace-nowrap">New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedChat && selectedChatDetails ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-line flex items-center">
            <Avatar
              name={selectedChatDetails.Seller.firm_name}
              className="h-10 w-10 text-sm"
            />
            <div className="ml-3">
              <h2 className="text-base font-medium">
                {selectedChatDetails.Seller.firm_name}
              </h2>
              <p className="text-xs text-gray-500">Seller</p>
            </div>
          </div>

          {/* Chat Messages - with hidden scrollbar */}
          <div
            className="flex-1 p-4 overflow-y-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isLoading ? (
              <div className="text-center text-gray-500 my-4">
                Loading messages...
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                No messages yet
              </div>
            ) : (
              Object.entries(groupMessagesByDate(chatMessages))
                .sort(
                  ([dateA], [dateB]) =>
                    new Date(dateA).getTime() - new Date(dateB).getTime()
                )
                .map(([dateKey, messages]) => (
                  <div key={dateKey} className="mb-4">
                    {/* Date Header */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-200 px-3 py-1 rounded-full">
                        <span className="text-xs text-gray-600 font-medium">
                          {formatDateHeader(dateKey)}
                        </span>
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {messages.map((msg) => {
                      // Check if this is a cancel request message
                      const isCancelRequest = msg.content?.includes("CANCEL REQUEST");
                      // Extract internal order ID - look for it in the message
                      let orderId = null;
                      
                      // The message might contain order details but not the internal ID
                      // We need to get it from the chat context or message metadata
                      // For now, try to extract any UUID that's NOT the seller ID
                      const uuidMatches = msg.content?.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/gi);
                      
                      if (uuidMatches && uuidMatches.length > 0) {
                        // If there are multiple UUIDs, the first one is likely the order ID
                        // and the second one is the seller ID
                        orderId = uuidMatches[0];
                      }
                      
                      // Debug log
                      if (isCancelRequest) {
                        console.log("Cancel request detected:", {
                          orderId: orderId,
                          allUUIDs: uuidMatches,
                          isCancelRequest: isCancelRequest,
                        });
                      }

                      return (
                        <div key={msg.id} className="mb-3">
                          <div
                            className={`flex ${
                              msg.senderType === "admin"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {msg.senderType !== "admin" && (
                              <div className="mr-2">
                                <Avatar
                                  name={
                                    msg.sender?.name ||
                                    selectedChatDetails?.Seller.firm_name
                                  }
                                  className="h-10 w-10 text-sm"
                                />
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 relative`}
                            >
                              {msg.content && (
                                <div>
                                  <div
                                    className="text-sm"
                                    dangerouslySetInnerHTML={{
                                      __html: msg.content,
                                    }}
                                  />
                                  {isCancelRequest && orderId && (
                                    <a
                                      href={`/admin/orders/${orderId}?openCancelModal=true&message=${encodeURIComponent(msg.content)}&autoCheck=true`}
                                      className="mt-3 inline-block px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors font-medium"
                                    >
                                      View Order & Process Cancel
                                    </a>
                                  )}
                                </div>
                              )}
                              {msg.fileUrl && (
                                <div className="mt-2">
                                  {typeof msg.fileUrl === "object" &&
                                  msg.fileUrl.fileType?.startsWith("image/") ? (
                                    <div className="space-y-2">
                                      <Image
                                        src={msg.fileUrl.url}
                                        alt={msg.fileUrl.fileName || "Attachment"}
                                        className="max-w-full h-auto rounded-md border border-gray-200"
                                        style={{
                                          width: "200px",
                                          height: "100px",
                                        }}
                                        width={200}
                                        height={100}
                                      />
                                      <div className="text-xs text-gray-500">
                                        <p className="xsmall-semibold">
                                          {msg.fileUrl.fileName}
                                        </p>
                                        <p className="xxsmall">
                                          {(
                                            (msg.fileUrl.fileSize || 0) /
                                            1024 /
                                            1024
                                          ).toFixed(2)}{" "}
                                          MB
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                                      <div className="flex items-center space-x-2">
                                        <div className="flex-shrink-0">
                                          <svg
                                            className="h-8 w-8 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                          </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <a
                                            href={
                                              typeof msg.fileUrl === "object"
                                                ? msg.fileUrl.url
                                                : msg.fileUrl
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700 text-sm font-medium truncate block"
                                          >
                                            {typeof msg.fileUrl === "object"
                                              ? msg.fileUrl.fileName
                                              : "Download attachment"}
                                          </a>
                                          {typeof msg.fileUrl === "object" &&
                                            msg.fileUrl.fileSize && (
                                              <p className="text-xs text-gray-500">
                                                {(
                                                  msg.fileUrl.fileSize /
                                                  1024 /
                                                  1024
                                                ).toFixed(2)}{" "}
                                                MB
                                              </p>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              <span className="text-xs block mt-1 text-gray-500">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {msg.pending && (
                                <span className="absolute right-2 top-2">
                                  <svg
                                    className="animate-spin h-4 w-4 text-blue-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                  </svg>
                                </span>
                              )}
                              {msg.failed && (
                                <span className="absolute right-2 top-2 text-red-500 text-xs">
                                  Failed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-line">
            {selectedFile && (
              <div className="p-2 bg-gray-100 rounded-md flex items-center justify-between">
                {isImageFile(selectedFile) ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-md"
                      />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClearFile}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm truncate max-w-[80%]">
                      {selectedFile.name}
                    </span>
                    <button
                      onClick={handleClearFile}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="flex items-center justify-center">
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faPaperclip} className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 mx-2">
                <textarea
                  rows={1}
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 border border-gray-line rounded-md resize-none focus:outline-none"
                />
              </div>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-00 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading || (!message.trim() && !selectedFile)}
              >
                <FontAwesomeIcon icon={faPaperPlane} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="mb-4">No chat selected</p>
            <p>Select a chat from the sidebar or start a new conversation</p>
          </div>
        </div>
      )}

      {/* Contact Details Sidebar */}
      {selectedChat && selectedChatDetails && (
        <div className="w-72 border-l border-gray-line overflow-y-auto p-4">
          <div className="text-center mb-6">
            <Avatar
              name={selectedChatDetails.Seller.firm_name}
              className="h-20 w-20 mx-auto text-xl"
            />
            <h2 className="mt-3 text-lg font-medium">
              {selectedChatDetails.Seller.firm_name}
            </h2>
            <p className="text-sm text-gray-500">Seller</p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs text-gray-500 uppercase">Email</h3>
              <p className="text-sm">{selectedChatDetails.Seller.email}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 uppercase">Phone</h3>
              <p className="text-sm">{selectedChatDetails.Seller.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
