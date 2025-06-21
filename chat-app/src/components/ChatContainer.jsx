import React, { useEffect, useRef, useContext, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);
  const [inputMessage, setInputMessage] = useState("");
  const scrollEnd = useRef();

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    await sendMessage({ text: inputMessage.trim() });
    setInputMessage("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      setInputMessage("");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-white bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} alt="Logo" className="w-20" />
        <p className="text-xl font-semibold">Chat Anytime, Anywhere</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black/30 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 px-5 border-b border-gray-600">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 text-white text-lg font-medium flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-6 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          alt="Help"
          className="hidden md:block w-5"
        />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isMine = msg.senderId === authUser._id;
          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt="message"
                  className="max-w-[230px] border border-gray-700 rounded-lg"
                />
              ) : (
                <p
                  className={`p-3 max-w-[70%] text-sm rounded-lg text-white break-words ${
                    isMine
                      ? "bg-violet-500/40 rounded-br-none"
                      : "bg-gray-700/40 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <div className="flex flex-col items-center text-xs text-gray-400">
                <img
                  src={
                    isMine
                      ? authUser.profilePic || assets.avatar_icon
                      : selectedUser.profilePic || assets.profile_martin
                  }
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                />
                <p className="mt-1">{formatMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom input */}
      <div className="border-t border-gray-700 bg-black/40 px-4 py-3">
        <form className="flex items-center gap-3" onSubmit={handleSendMessage}>
          <div className="flex items-center flex-1 bg-gray-800/60 px-4 py-2 rounded-full">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
              placeholder="Send a message..."
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 focus:outline-none"
            />
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              onChange={handleSendImage}
              className="hidden"
            />
            <label htmlFor="image-upload" className="cursor-pointer ml-3">
              <img src={assets.gallery_icon} alt="Attach" className="w-5" />
            </label>
          </div>
          <button type="submit">
            <img src={assets.send_button} alt="Send" className="w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;
