import { ReactNode, useCallback, useEffect, useState } from "react";
import CommentsSlider from "../components/comments_slider";
import RestPostMedia from "../components/rest_post_media";
import { appendPosts, setPosts } from "../utils/store";
import { useDispatch, useSelector } from "react-redux";
import PostSkelaton from "../components/post_skelaton";
import Post, { PostProps } from "../components/post";
import ButtomSheet from "../components/buttom_sheet";
import { useNavigate } from "react-router-dom";
import "../styles/comments-slider.css";
import { Box } from "@mui/material";
import api from "../utils/api";

export default function Home() {
  document.title = "Sociallty";
  const posts = useSelector(
    (state: { postsState: { value: PostProps[] } }) => state.postsState.value
  );
  const [firstInit, setFirstInit] = useState(true);
  const [pageNumebr, setPageNumber] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
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
    try {
      const res = await api.get<{ posts: PostProps[]; has_next: boolean }>(
        `/today-posts/?page=${pageNumebr}`
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
      return Promise.reject("error fetching the posts");
    }
  }, [pageNumebr, dispatch]);

  // fetch the posts
  useEffect(() => {
    getPosts();
  }, [pageNumebr, getPosts]);

  return (
    <main>
      <ButtomSheet />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          marginBlock: "10px",
        }}
      >
        {/* <c-flip_card Type="profile"></c-flip_card> */}
        <button
          type="button"
          id="post-btn"
          onClick={() => navigate("/make-post")}
          style={{
            border: "none",
            backgroundColor: "rgb(37 124 205 / 78%)",
            color: "#fff",
            borderRadius: "15px",
            padding: "10px 40px",
            fontSize: "large",
            cursor: "pointer",
          }}
        >
          <div>
            <i className="fa-solid fa-upload"></i>
            <span id="post-btn-text">New post</span>
          </div>
        </button>
      </div>
      <RestPostMedia />
      <Box id="posts">
        <CommentsSlider />
        {!loaded ? (
          <SkelatonPlaceHolders />
        ) : (
          <>
            {posts.map((data, index) => (
              <Post post={data} key={index} />
            ))}
            <div>
              {hasNext ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPageNumber((prev) => prev + 1)}
                >
                  Load More
                </button>
              ) : hasNext === false && <p>No More Posts...</p>}
            </div>
          </>
        )}
      </Box>
    </main>
  );
}
