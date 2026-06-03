import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);

  // ✅ Get ALL posts (feed)
  const getPosts = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/posts", {
        method: "GET",
      });

      const data = await response.json();
      dispatch(setPosts({ posts: data }));
    } catch (err) {
      console.log("Error fetching posts:", err);
    }
  }, [dispatch]);

  // ✅ Get USER posts (profile)
  const getUserPosts = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/posts/${userId}/posts`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      dispatch(setPosts({ posts: data }));
    } catch (err) {
      console.log("Error fetching user posts:", err);
    }
  }, [dispatch, userId]);

  // ✅ Main effect
  useEffect(() => {
    if (isProfile && userId) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, [isProfile, userId, getPosts, getUserPosts]);

  return (
    <div>
      {posts.map(
        ({
          _id,
          userId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
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
            userPicturePath={userPicturePath}
            likes={likes}
            comments={comments}
          />
        )
      )}
    </div>
  );
};

export default PostsWidget;