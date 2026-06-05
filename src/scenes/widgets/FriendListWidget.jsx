import {
  Box,
  Typography,
  useTheme,
  IconButton,
} from "@mui/material";

import MessageIcon from "@mui/icons-material/Message";

import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setFriends } from "state";
import BASE_URL from "api/config";

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { palette } = useTheme();

  const token = useSelector((state) => state.token);

  // safe fallback
  const friends = useSelector(
    (state) => state.user?.friends || []
  );

  const getFriends = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/${userId}/friends`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // REMOVE DUPLICATE FRIENDS
      const uniqueFriends = data.filter(
        (friend, index, self) =>
          index ===
          self.findIndex((f) => f._id === friend._id)
      );

      dispatch(setFriends({ friends: uniqueFriends }));
    } catch (error) {
      console.log("Friend Fetch Error:", error);
    }
  };

  useEffect(() => {
    getFriends();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openChat = (friendId) => {
    navigate(`/chat/${friendId}`);
  };

  return (
    <WidgetWrapper>
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.5rem" }}
      >
        Friend List
      </Typography>

      <Box
        display="flex"
        flexDirection="column"
        gap="1.5rem"
      >
        {friends.length > 0 ? (
          friends.map((friend) => (
            <Box
              key={friend._id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Friend
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation}
                userPicturePath={friend.picturePath}
              />

              {/* MESSAGE BUTTON */}
              <IconButton
                onClick={() => openChat(friend._id)}
                sx={{
                  backgroundColor: palette.primary.light,
                  p: "0.5rem",
                }}
              >
                <MessageIcon />
              </IconButton>
            </Box>
          ))
        ) : (
          <Typography color={palette.neutral.medium}>
            No Friends Found
          </Typography>
        )}
      </Box>
    </WidgetWrapper>
  );
};

export default FriendListWidget;