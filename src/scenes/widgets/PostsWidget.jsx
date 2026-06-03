
import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { setPosts } from "state";

import PostWidget from "./PostWidget";
import BASE_URL from "api/config";


const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();

  const posts = useSelector((state) => state.posts);

  const token = useSelector((state) => state.token);

  useEffect(() => {
    const fetchPosts = async (url) => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      dispatch(setPosts({ posts: data }));
    };

    if (isProfile) {
      fetchPosts(`${BASE_URL}/posts/${userId}/posts`);
    } else {
      fetchPosts(`${BASE_URL}/posts`);
    }
  }, [isProfile, userId, token, dispatch]);

  return (
    <>
      {posts.map(
        ({
          _id,
          userId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          videoPath,
          userPicturePath,
          likes,
          comments,
        }) => (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={userId}
            name={`${firstName} ${lastName}`}
            description={description}
            location={location}
            picturePath={picturePath}
            videoPath={videoPath}
            userPicturePath={userPicturePath}
            likes={likes}
            comments={comments}
          />
        )
      )}
    </>
  );
};

export default PostsWidget;
