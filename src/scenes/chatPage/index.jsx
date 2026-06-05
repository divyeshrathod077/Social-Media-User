import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  LinearProgress,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import socket from "../../socket";

import BASE_URL from "../../api/config";

const ChatPage = () => {
  const { receiverId } = useParams();

  const token = useSelector(
    (state) => state.token
  );

  const user = useSelector(
    (state) => state.user
  );

  const mode = useSelector(
    (state) => state.mode
  );

  const [receiver, setReceiver] =
    useState(null);

  const [conversation, setConversation] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [image, setImage] =
    useState(null);

  const [video, setVideo] =
    useState(null);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const scrollRef = useRef();

  /* =========================
     THEME
  ========================= */

  const isDarkMode = mode === "dark";

  const background = isDarkMode
    ? "#121212"
    : "#ffffff";

  const headerBg = isDarkMode
    ? "#1e1e1e"
    : "#f5f5f5";

  const textColor = isDarkMode
    ? "#ffffff"
    : "#000000";

  const receiverMsg = isDarkMode
    ? "#2b2b2b"
    : "#e4e6eb";

  const senderMsg = "#1976d2";

  const borderColor = isDarkMode
    ? "#333"
    : "#ccc";

  /* =========================
     GET RECEIVER
  ========================= */

  useEffect(() => {
    const getReceiver = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/users/${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        setReceiver(data);
      } catch (err) {
        console.log(err);
      }
    };

    if (receiverId && token) {
      getReceiver();
    }
  }, [receiverId, token]);

  /* =========================
     SOCKET
  ========================= */

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("addUser", user._id);

    socket.on("getUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("getMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        data,
      ]);
    });

    return () => {
      socket.off("getUsers");
      socket.off("getMessage");
    };
  }, [user]);

  /* =========================
     GET MESSAGES
  ========================= */

  const getMessages = useCallback(
    async (conversationId) => {
      try {
        const response = await fetch(
          `${BASE_URL}/chat/message/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        setMessages(data);
      } catch (err) {
        console.log(err);
      }
    },
    [token]
  );

  /* =========================
     CONVERSATION
  ========================= */

  useEffect(() => {
    const createConversation =
      async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/chat/conversation`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                senderId: user._id,
                receiverId,
              }),
            }
          );

          const data =
            await response.json();

          setConversation(data);

          getMessages(data._id);
        } catch (err) {
          console.log(err);
        }
      };

    if (
      user?._id &&
      receiverId &&
      token
    ) {
      createConversation();
    }
  }, [
    receiverId,
    token,
    user?._id,
    getMessages,
  ]);

  /* =========================
     FILE SELECT
  ========================= */

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setVideo(null);
    }
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];

    if (file) {
      setVideo(file);
      setImage(null);
    }
  };

  /* =========================
     SEND MESSAGE
  ========================= */

  const sendMessage = async () => {
    if (
      !text.trim() &&
      !image &&
      !video
    )
      return;

    try {
      const hasMedia =
        image || video;

      /* ONLY SHOW BAR
         FOR IMAGE/VIDEO */

      if (hasMedia) {
        setUploading(true);
        setUploadProgress(0);
      }

      const formData =
        new FormData();

      formData.append(
        "conversationId",
        conversation._id
      );

      formData.append(
        "senderId",
        user._id
      );

      formData.append(
        "text",
        text
      );

      if (image) {
        formData.append(
          "file",
          image
        );
      }

      if (video) {
        formData.append(
          "file",
          video
        );
      }

      const xhr =
        new XMLHttpRequest();

      xhr.open(
        "POST",
        `${BASE_URL}/chat/message`
      );

      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${token}`
      );

      /* PROGRESS */

      xhr.upload.onprogress = (
        event
      ) => {
        if (
          hasMedia &&
          event.lengthComputable
        ) {
          const percent =
            Math.round(
              (event.loaded *
                100) /
                event.total
            );

          setUploadProgress(
            percent
          );
        }
      };

      /* SUCCESS */

      xhr.onload = () => {
        if (
          xhr.status === 200 ||
          xhr.status === 201
        ) {
          const savedMessage =
            JSON.parse(
              xhr.responseText
            );

          setMessages((prev) => [
            ...prev,
            savedMessage,
          ]);

          socket.emit(
            "sendMessage",
            {
              senderId:
                user._id,

              receiverId,

              text,

              media:
                savedMessage.media,

              mediaType:
                savedMessage.mediaType,
            }
          );

          setText("");

          setImage(null);

          setVideo(null);

          setUploadProgress(0);

          setUploading(false);
        } else {
          console.log(
            xhr.responseText
          );

          setUploading(false);
        }
      };

      /* ERROR */

      xhr.onerror = () => {
        console.log(
          "Upload Failed"
        );

        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      console.log(err);

      setUploading(false);
    }
  };

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* =========================
     ONLINE STATUS
  ========================= */

  const isOnline = onlineUsers.some(
    (u) => u[0] === receiverId
  );

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      bgcolor={background}
    >
      {/* HEADER */}

      <Box
        p="1rem"
        display="flex"
        alignItems="center"
        gap="1rem"
        borderBottom={`1px solid ${borderColor}`}
        bgcolor={headerBg}
      >
        <Avatar
          src={`${BASE_URL}/assets/${receiver?.picturePath}`}
        />

        <Box>
          <Typography
            color={textColor}
            fontWeight="bold"
          >
            {receiver?.firstName}{" "}
            {receiver?.lastName}
          </Typography>

          <Typography
            color={
              isOnline
                ? "green"
                : "gray"
            }
            fontSize="0.8rem"
          >
            {isOnline
              ? "Online"
              : "Offline"}
          </Typography>
        </Box>
      </Box>

      {/* MESSAGES */}

      <Box
        flex="1"
        p="1rem"
        overflow="auto"
      >
        {messages.map((msg, index) => {
          const own =
            msg.senderId === user._id;

          return (
            <Box
              key={msg._id || index}
              display="flex"
              justifyContent={
                own
                  ? "flex-end"
                  : "flex-start"
              }
              mb="1rem"
            >
              <Box
                ref={scrollRef}
                sx={{
                  backgroundColor: own
                    ? senderMsg
                    : receiverMsg,

                  color: own
                    ? "#fff"
                    : textColor,

                  padding: "10px 15px",

                  borderRadius: "15px",

                  maxWidth: "60%",
                }}
              >
                {msg.text && (
                  <Typography>
                    {msg.text}
                  </Typography>
                )}

                {/* IMAGE */}

                {msg.mediaType ===
                  "image" && (
                  <img
                    src={msg.media}
                    alt=""
                    width="100%"
                    style={{
                      marginTop:
                        "10px",

                      borderRadius:
                        "10px",
                    }}
                  />
                )}

                {/* VIDEO */}

                {msg.mediaType ===
                  "video" && (
                  <video
                    controls
                    width="100%"
                    style={{
                      marginTop:
                        "10px",

                      borderRadius:
                        "10px",
                    }}
                  >
                    <source
                      src={msg.media}
                      type="video/mp4"
                    />
                  </video>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* UPLOAD BAR */}

      {uploading &&
        (image || video) && (
          <Box px="1rem" pb="0.5rem">
            <Typography
              mb="0.5rem"
              color={textColor}
              fontSize="0.9rem"
            >
              Uploading{" "}
              {image
                ? "Image"
                : "Video"}
              ... {uploadProgress}%
            </Typography>

            <LinearProgress
              variant="determinate"
              value={uploadProgress}
            />
          </Box>
        )}

      {/* FOOTER */}

      <Box
        p="1rem"
        display="flex"
        gap="0.5rem"
        borderTop={`1px solid ${borderColor}`}
        bgcolor={headerBg}
      >
        {/* IMAGE */}

        <IconButton
          component="label"
        >
          <ImageIcon
            sx={{
              color: textColor,
            }}
          />

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={handleImage}
          />
        </IconButton>

        {/* VIDEO */}

        <IconButton
          component="label"
        >
          <VideocamIcon
            sx={{
              color: textColor,
            }}
          />

          <input
            hidden
            type="file"
            accept="video/*"
            onChange={handleVideo}
          />
        </IconButton>

        {/* INPUT */}

        <TextField
          fullWidth
          placeholder="Type message..."
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          sx={{
            input: {
              color: textColor,
            },

            "& .MuiOutlinedInput-root":
              {
                "& fieldset": {
                  borderColor:
                    borderColor,
                },
              },
          }}
        />

        {/* SEND */}

        <IconButton
          onClick={sendMessage}
        >
          <SendIcon
            sx={{
              color: "#1976d2",
            }}
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatPage;