import { ReactNode, useCallback, useEffect, useState } from "react";
import { ApiUrls, PostsStateType } from "../utils/constants";
import CommentsSlider from "../components/comments_slider";
import RestPostMedia from "../components/rest_post_media";
import { appendPosts, setPosts } from "../utils/store";
import { useDispatch, useSelector } from "react-redux";
import PostSkelaton from "../components/post_skelaton";
import Post, { PostProps } from "../components/post";
import ButtomSheet from "../components/buttom_sheet";
import UploadIcon from "@mui/icons-material/Upload";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import "../styles/comments-slider.css";
import { Helmet } from "react-helmet";
import api from "../utils/api";

export default function Home() {
  const posts = useSelector(
    (state: PostsStateType) => state.postsState.value
  );
  const [firstInit, setFirstInit] = useState(true);
  const [pageNumebr, setPageNumber] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const SkelatonPlaceHolders = () => {
    const sks: ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      sks.push(<PostSkelaton key={i} />);
    }
    return sks;
  };

  const getPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ posts: PostProps[]; has_next: boolean }>(
        ApiUrls.posts_today + pageNumebr.toString()
      );
      if (res.status === 200) {
        if (firstInit) {
          dispatch(setPosts(res.data.posts));
          setFirstInit(false);
          setLoaded(true);
        } else {
          dispatch(appendPosts(res.data.posts));
        }
        setHasNext(res.data.has_next);
      }
    } catch {
      console.error("error fetching the posts");
    }
    setLoading(false);
  }, [pageNumebr, dispatch]);

  // fetch the posts
  useEffect(() => {
    getPosts();
  }, [pageNumebr, getPosts]);

  return (
    <main>
      <Helmet>
        <title>Sociallty</title>
        <meta name="description" content="Find and stay up to date for today's posts like, share, comment" />
      </Helmet>
      <ButtomSheet />
      <div className="d-flex justify-content-center align-items-center flex-direction-column mb-2">
        {/* <c-flip_card Type="profile"></c-flip_card> */}
        <Button
          type="button"
          id="post-btn"
          variant="contained"
          onClick={() => navigate("/make-post")}
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
      <RestPostMedia />
      <Box id="posts">
        <CommentsSlider />
        {!loaded ? (
          <SkelatonPlaceHolders />
        ) : (
          <>
            {posts.map((data) => (
              <Post post={data} key={data.id} />
            ))}
            <div>
              {hasNext ? (
                <Button
                  type="button"
                  variant="contained"
                  loading={loading}
                  loadingPosition="start"
                  onClick={() => setPageNumber((prev) => prev + 1)}
                >
                  {loading ? 'Please wait...' : 'Load More'}
                </Button>
              ) : (
                hasNext === false && <p>No More Posts...</p>
              )}
            </div>
          </>
        )}
      </Box>
    </main>
  );
}
