import React, { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiUrls, PostsStateType } from "../utils/constants";
import { appendPosts, setPosts } from "../utils/store";
import { useDispatch, useSelector } from "react-redux";
import PostSkelaton from "../components/post_skelaton";
import { useLoadingBar } from "react-top-loading-bar";
import UploadIcon from "@mui/icons-material/Upload";
import { useNavigate } from "react-router-dom";
import { PostProps } from "../components/post";
import { Box, Button } from "@mui/material";
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
    posts.map((post) => <LazyPosts post={post} key={post.id} />), [posts]
  );
  return <Suspense fallback={<PostSkelaton />}>{renderPosts}</Suspense>;
}
);


export default function Home() {
  const posts = useSelector((state: PostsStateType) => state.postsState.value);
  const [pageNumebr, setPageNumber] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false);
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getPosts = useCallback(async () => {
    loadingRef.current = true;
    try {
      const res = await api.get<{
        posts: PostProps[];
        has_next: boolean;
      }>(ApiUrls.posts_today + pageNumebr.toString());
      if (res.status === 200) {
        if (pageNumebr === 1) {
          dispatch(setPosts(res.data.posts));
          setLoaded(true);
          complete();
        } else {
          dispatch(appendPosts(res.data.posts));
        }
        setHasNext(res.data.has_next);
      }
    } catch {
      console.error("error fetching the posts");
    } finally {
      setTimeout(() => {
        loadingRef.current = false;
      }, 3000);
    }
  }, [pageNumebr]);


  const handleScrollEvent = useCallback(() => {
    if (window.scrollY + innerHeight >= document.documentElement.scrollHeight - 800 && hasNext && !loadingRef.current) {
      setPageNumber((prev) => prev + 1);
    }
  }, [hasNext]);

  // fetch the posts
  useEffect(() => {
    getPosts();
  }, [pageNumebr, getPosts]);

  // setup scroll listener
  useEffect(() => {
    window.addEventListener("scroll", handleScrollEvent);
    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
    };
  }, [handleScrollEvent]);

  return (
    <main>
      <Helmet>
        <title>Sociallty</title>
        <meta
          name="description"
          content="Find and stay up to date for today's posts like, share, comment"
        />
        <meta property="og:image" content="/favicon.ico" />
        <meta property="og:title" content="Sociallty" />
        <meta property="og:description" content="Find and stay up to date for today's posts like, share, comment" />
        <meta property="og:url" content={location.href} />
        <meta property="og:type" content="website" />
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
            <Posts posts={posts}/>
        )}
      </Box>
    </main>
  );
}
