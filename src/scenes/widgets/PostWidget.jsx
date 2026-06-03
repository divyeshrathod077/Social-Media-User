import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  DeleteOutlined,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";

import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";

import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { setPost, setPosts } from "state";
import Swal from "sweetalert2";
import BASE_URL from "api/config";


const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,

  picturePath,
  videoPath,

  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] =
    useState(false);

  const dispatch = useDispatch();

  const token = useSelector(
    (state) => state.token
  );

  const loggedInUserId = useSelector(
    (state) => state.user._id
  );

  const isLiked = Boolean(
    likes[loggedInUserId]
  );

  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();

  const main = palette.neutral.main;

  const primary = palette.primary.main;

  /* =========================
     LIKE POST
  ========================= */

  const patchLike = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/posts/${postId}/like`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            userId: loggedInUserId,
          }),
        }
      );

      const updatedPost =
        await response.json();

      dispatch(
        setPost({
          post: updatedPost,
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     DELETE POST
  ========================= */
const deletePostHandler = async () => {
  const result = await Swal.fire({
    title: "Delete Post?",
    text: "This post will be removed permanently.",
    icon: "warning",

    showCancelButton: true,

    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",

    confirmButtonText: "Yes, delete it!",
  });

  // CANCEL
  if (!result.isConfirmed) return;

  try {
    const response = await fetch(
      `${BASE_URL}/posts/${postId}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedPosts = await response.json();

    dispatch(
      setPosts({
        posts: updatedPosts,
      })
    );

    // SUCCESS ALERT
    Swal.fire({
      title: "Deleted!",
      text: "Your post has been deleted.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    console.log(err);

    Swal.fire({
      title: "Error!",
      text: "Something went wrong.",
      icon: "error",
    });
  }
};
 
  /* =========================
     IMAGE URL
  ========================= */

  const image =
    picturePath &&
    (picturePath.startsWith("http")
      ? picturePath
      : `${BASE_URL}/assets/${picturePath}`);

  /* =========================
     VIDEO URL
  ========================= */

  const video =
    videoPath &&
    (videoPath.startsWith("http")
      ? videoPath
      : `${BASE_URL}/assets/${videoPath}`);

  return (
    <WidgetWrapper m="2rem 0">
      {/* USER */}
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={
          userPicturePath
        }
      />

      {/* DESCRIPTION */}
      <Typography
        color={main}
        sx={{ mt: "1rem" }}
      >
        {description}
      </Typography>

      {/* IMAGE */}
      {image && (
        <Box mt="1rem">
          <img
            src={image}
            alt="post"
            width="100%"
            style={{
              borderRadius: "0.75rem",
              maxHeight: "500px",
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      {/* VIDEO */}
      {video && (
        <Box mt="1rem">
          <video
            width="100%"
            height="500"
            controls
            style={{
              borderRadius: "0.75rem",
              backgroundColor: "black",
            }}
          >
            <source
              src={video}
              type="video/mp4"
            />

            Your browser does not
            support video.
          </video>
        </Box>
      )}

      {/* ACTIONS */}
      <FlexBetween mt="0.5rem">
        <FlexBetween gap="1rem">
          {/* LIKE */}
          <FlexBetween gap="0.3rem">
            <IconButton
              onClick={patchLike}
            >
              {isLiked ? (
                <FavoriteOutlined
                  sx={{
                    color: primary,
                  }}
                />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>

            <Typography>
              {likeCount}
            </Typography>
          </FlexBetween>

          {/* COMMENT */}
          <FlexBetween gap="0.3rem">
            <IconButton
              onClick={() =>
                setIsComments(
                  !isComments
                )
              }
            >
              <ChatBubbleOutlineOutlined />
            </IconButton>

            <Typography>
              {comments.length}
            </Typography>
          </FlexBetween>
        </FlexBetween>

        {/* RIGHT SIDE */}
        <FlexBetween gap="0.5rem">
          {/* SHARE */}
          <IconButton>
            <ShareOutlined />
          </IconButton>

          {/* DELETE */}
          {loggedInUserId ===
            postUserId && (
            <IconButton
              onClick={
                deletePostHandler
              }
            >
              <DeleteOutlined />
            </IconButton>
          )}
        </FlexBetween>
      </FlexBetween>

      {/* COMMENTS */}
      {isComments && (
        <Box mt="0.5rem">
          {comments.map(
            (comment, i) => (
              <Box key={i}>
                <Divider />

                <Typography
                  sx={{
                    color: main,
                    m: "0.5rem 0",
                    pl: "1rem",
                  }}
                >
                  {comment}
                </Typography>
              </Box>
            )
          )}

          <Divider />
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;