import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  // Fetch all users and unseen messages counts
  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [axios]);

  // Fetch messages for selected user
  const getMessages = useCallback(
    async (userId) => {
      try {
        const { data } = await axios.get(`/api/messages/${userId}`);
        if (data.success) {
          setMessages(data.messages);
          // Mark all messages from this user as seen locally and update unseenMessages
          setUnseenMessages((prev) => {
            const newUnseen = { ...prev };
            delete newUnseen[userId];
            return newUnseen;
          });
          // Inform backend to mark messages as read
          await axios.put(`/api/messages/mark/${userId}`);
        } else {
          toast.error(data.message || "Failed to fetch messages");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    },
    [axios]
  );

  // Send a message to selected user
  const sendMessage = async (messageData) => {
    if (!selectedUser) {
      toast.error("Please select a user to send message");
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Handle incoming new messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        // If the message is from currently selected user, mark as seen and update messages
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        try {
          await axios.put(`/api/messages/mark/${newMessage.senderId}`);
          setUnseenMessages((prev) => {
            const newUnseen = { ...prev };
            delete newUnseen[newMessage.senderId];
            return newUnseen;
          });
        } catch (error) {
          // You can ignore or show toast here
        }
      } else {
        // If message from other user, increment unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, axios]);

  // When selectedUser changes, fetch messages from that user
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else {
      setMessages([]);
    }
  }, [selectedUser, getMessages]);

  // When authUser changes (login/logout), reset chat state and fetch users
  useEffect(() => {
    setUsers([]);
    setMessages([]);
    setSelectedUser(null);
    setUnseenMessages({});

    if (authUser) {
      getUsers();
    }
  }, [authUser, getUsers]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
