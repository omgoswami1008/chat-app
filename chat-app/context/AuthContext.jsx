import { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL; // Vite env variable
axios.defaults.baseURL = backendUrl;

// Context initialization
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const socketRef = useRef(null); // Ref to hold socket instance to avoid stale closures

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        setAuthUser(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setAuthUser(null);
    }
  };

  // Login function
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["token"] = data.token; // Set token header here
        connectSocket(data.userData); // then connect socket
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    toast.success("Logged out successfully");

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    } else {
      setAuthUser(null);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const connectSocket = (userData) => {
    if (!userData) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const newSocket = io(backendUrl, { transports: ["websocket"] });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("authenticate", { userId: userData._id });
    });

    newSocket.on("getOnlineUser", (userIds) => {
      console.log("Online users from socket:", userIds);
      setOnlineUsers(userIds);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setOnlineUsers([]);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  // Context value
  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
