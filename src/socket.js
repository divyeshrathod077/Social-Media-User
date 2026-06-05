import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://social-media-server-eiad.onrender.com" // ✅ your backend Render URL
    : "http://localhost:3001";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // allow fallback
  withCredentials: true,
});

export default socket;
