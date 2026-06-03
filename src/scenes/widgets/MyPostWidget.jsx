
import {
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
  VideoLibraryOutlined,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";

import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import BASE_URL from "api/config";
import axios from "axios";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();

  const [isUpload, setIsUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [post, setPost] = useState("");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { palette } = useTheme();

  const { _id } = useSelector((state) => state.user);

  const token = useSelector((state) => state.token);

  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const handlePost = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("userId", _id);
      formData.append("description", post);

      if (file) {
        formData.append("media", file);
      }

      const response = await axios.post(
        `${BASE_URL}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          onUploadProgress: (data) => {
            const percent = Math.round(
              (data.loaded * 100) / data.total
            );

            setProgress(percent);
          },
        }
      );

      dispatch(setPosts({ posts: response.data }));

      setFile(null);
      setPost("");
      setProgress(0);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1rem">
        <UserImage image={picturePath} />

        <InputBase
          placeholder="What's on your mind..."
          value={post}
          onChange={(e) => setPost(e.target.value)}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
      </FlexBetween>

      {isUpload && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png,.mp4,.mov,.avi"
            multiple={false}
            onDrop={(acceptedFiles) =>
              setFile(acceptedFiles[0])
            }
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{
                    "&:hover": {
                      cursor: "pointer",
                    },
                  }}
                >
                  <input {...getInputProps()} />

                  {!file ? (
                    <Typography>
                      Add Image or Video
                    </Typography>
                  ) : (
                    <FlexBetween>
                      <Typography>
                        {file.name}
                      </Typography>

                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>

                {file && (
                  <IconButton
                    onClick={() => setFile(null)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>

          {loading && (
            <Box mt="1rem">
              <LinearProgress
                variant="determinate"
                value={progress}
              />

              <Typography mt="0.5rem">
                Uploading {progress}%
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        <FlexBetween
          gap="0.3rem"
          onClick={() => setIsUpload(!isUpload)}
        >
          <ImageOutlined sx={{ color: mediumMain }} />

          <VideoLibraryOutlined
            sx={{ color: mediumMain }}
          />

          <Typography
            color={mediumMain}
            sx={{
              "&:hover": {
                cursor: "pointer",
                color: medium,
              },
            }}
          >
            Media
          </Typography>
        </FlexBetween>

        {isNonMobileScreens && (
          <Typography color={mediumMain}>
            Upload Images & Videos
          </Typography>
        )}

        <Button
          disabled={!post && !file}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          POST
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
