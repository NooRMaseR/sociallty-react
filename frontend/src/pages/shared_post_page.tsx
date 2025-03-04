import React, { memo, Suspense, useCallback, useEffect, useState } from "react";
import { ApiUrls, PostsStateType } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import PostSkelaton from "../components/post_skelaton";
import { PostProps } from "../components/post";
import { useParams } from "react-router-dom";
import { setPosts } from "../utils/store";
import { Helmet } from "react-helmet";
import { Box } from "@mui/material";
import api from "../utils/api";

const LazyPost = React.lazy(() => import("../components/post"));
const LazyRestPostMedia = React.lazy(() => import("../components/rest_post_media"));
const LazyCommentsSlider = React.lazy(() => import("../components/comments_slider"));

export default function SharedPostPage() {
  const { id } = useParams();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<number>(200);
  const post = useSelector((state: PostsStateType) => state.postsState.value);
  const dispatch = useDispatch();
  
  const getPost = useCallback(async () => {
    try {
      const res = await api.get<PostProps>(ApiUrls.post + id?.toString());
      if (res?.status === 200) {
        dispatch(setPosts([res.data]));
        setIsLoaded(true);
      } else {
        setErrorType(404);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorType(error.response.status);
    }
  }, [id, dispatch]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  const Posts = memo(() => {
    if (isLoaded) return post.map((po) =>
      <Suspense fallback={<PostSkelaton />}>
        <LazyPost post={po} key={po.id} />
      </Suspense>
    );
    else if (errorType === 404) return <h1 className="text-white">Something went Wrong....</h1>;
    else return <PostSkelaton />;
  });

  return (
    <Box id="posts">
      <Helmet>
        <title>Sociallty</title>
        <meta
          name="description"
          content="Check Out This Post From This Link, Check it out Now"
        />
      </Helmet>
      <LazyRestPostMedia />
      <LazyCommentsSlider />
      <Posts />
    </Box>
  );
}
