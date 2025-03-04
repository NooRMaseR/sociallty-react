import React, { memo, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { appendPosts, setCount, setPosts } from "../utils/store";
import { ApiUrls, PostsStateType } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import PostSkelaton from "../components/post_skelaton";
import { useLoadingBar } from "react-top-loading-bar";
import UploadIcon from "@mui/icons-material/Upload";
import { useNavigate } from "react-router-dom";
import { PostProps } from "../components/post";
import { Box, Button } from "@mui/material";
import "../styles/comments-slider.css";
import { Helmet } from "react-helmet";
import api from "../utils/api";
import "../styles/post.css";

const SkelatonPlaceHolders = memo(() => (
  Array.from({ length: 5 }, (_, i) => <PostSkelaton key={i} />)
));

const LazyPosts = React.lazy(() => import("../components/post"));
const LazyBottomSheet = React.lazy(() => import("../components/buttom_sheet"));
const LazyRestPostMedia = React.lazy(() => import("../components/rest_post_media"));
const LazyCommentsSlider = React.lazy(() => import("../components/comments_slider"));

const Posts = memo(({ posts }: { posts: PostProps[] }) => {
  const renderPosts = useMemo(() =>
    posts.map((data) => <LazyPosts post={data} key={data.id} />), [posts]
  );
  return <Suspense fallback={<PostSkelaton />}>{renderPosts}</Suspense>;
}
);


export default function Home() {
  const posts = useSelector((state: PostsStateType) => state.postsState.value);
  const [firstInit, setFirstInit] = useState(true);
  const [pageNumebr, setPageNumber] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{
        posts: PostProps[];
        has_next: boolean;
        friends_requests_count: number;
      }>(ApiUrls.posts_today + pageNumebr.toString());
      if (res.status === 200) {
        if (firstInit) {
          dispatch(setPosts(res.data.posts));
          dispatch(setCount(res.data.friends_requests_count));
          setFirstInit(false);
          setLoaded(true);
          complete();
        } else {
          dispatch(appendPosts(res.data.posts));
        }
        setHasNext(res.data.has_next);
      }
    } catch {
      console.error("error fetching the posts");
    }
    setLoading(false);
  }, [pageNumebr, dispatch, complete]);

  // fetch the posts
  useEffect(() => {
    getPosts();
  }, [getPosts, pageNumebr]);

  return (
    <main>
      <Helmet>
        <title>Sociallty</title>
        <meta
          name="description"
          content="Find and stay up to date for today's posts like, share, comment"
        />
      </Helmet>
      <LazyBottomSheet />
      <div className="d-flex justify-content-center align-items-center flex-direction-column mb-2">
        <Button
          type="button"
          id="post-btn"
          variant="contained"
          onClick={() => {
            start();
            navigate("/make-post");
          }}
          sx={{
            padding: "10px 30px",
            fontSize: "large",
            cursor: "pointer",
          }}
        >
          <UploadIcon />
          <span id="post-btn-text">New post</span>
        </Button>
      </div>
      <LazyRestPostMedia />
      <Box id="posts">
        <LazyCommentsSlider />
        {!loaded ? (
          <SkelatonPlaceHolders />
        ) : (
          <>
            <Posts posts={posts}/>
            <div>
              {hasNext ? (
                <Button
                  type="button"
                  variant="contained"
                  loading={loading}
                  loadingPosition="start"
                  onClick={() => setPageNumber((prev) => prev + 1)}
                >
                  {loading ? "Please wait..." : "Load More"}
                </Button>
              ) : (
                hasNext === false ? <p>No More Posts...</p> : null
              )}
            </div>
          </>
        )}
      </Box>
    </main>
  );
}
