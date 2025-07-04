import React, { useContext, useState, useEffect } from "react";
import assets, { imagesDummyData } from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [mesImages, setMesImages] = useState([]);

  //get all images from messages
  useEffect(() => {
    setMesImages(
      messages
        .filter((message) => message.image)
        .map((message) => message.image)
    );
  }, [messages]);

  return (
    selectedUser && (
      <div className="relative w-full h-full bg-[#8185B2]/10 text-white overflow-y-auto">
        {/* Profile Section */}
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            className="w-20 aspect-[1/1] rounded-full"
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && (
              <p className="w-2 h-2 rounded-full bg-green-500"></p>
            )}
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto">{selectedUser.bio}</p>
        </div>

        <hr className="border-[#ffffff50] my-4" />

        {/* Media Section */}
        <div className="px-5 text-xs pb-32">
          {" "}
          {/* Add bottom padding here */}
          <p>Media</p>
          <div className="mt-2 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4 opacity-80">
            {mesImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)}
                className="cursor-pointer rounded"
              >
                <img src={url} alt="" className="h-full rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => logout()}
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm font-light py-2 px-10 rounded-full"
          >
            LogOut
          </button>
        </div>
      </div>
    )
  );
};

export default RightSidebar;
