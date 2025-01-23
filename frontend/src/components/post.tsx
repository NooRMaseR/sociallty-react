import {
  setBackBg,
  setBottomSheetOpen,
  setPostContentSlider,
  setSliderOpen,
} from "../utils/store";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import { API_URL, User, Visibility } from "../utils/constants";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import ShareIcon from "@mui/icons-material/Share";
import { handleShare } from "../utils/functions";
import { Avatar, Box } from "@mui/material";
import { ReactNode, useState } from "react";
import PostSkelaton from "./post_skelaton";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/post.css";

export interface Media {
  readonly id: number;
  content_type: string;
  content: string;
  poster: string;
  added?: boolean;
}

export interface PostProps {
  readonly id: number;
  readonly user: User;
  readonly media: Media[];
  readonly created_at: string;
  readonly visibility: Visibility;
  readonly description: string;
  comments_count: number;
  likes_count: number;
}

export default function Post({ post }: { post: PostProps }) {
  const comments_count = useSelector(
    (state: { postsState: { value: PostProps[] } }) =>
      state.postsState.value.find((po) => po.id === post.id)?.comments_count ??
      post.comments_count
  );
  const [likes_count, setLikesCount] = useState<number>(post.likes_count);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [photoID, setPhotoID] = useState<number>(-1);
  const [loaded, setLoaded] = useState<boolean>(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const dispatch = useDispatch();

  if (inView && !loaded) {
    setLoaded(true);
  }

  const handelLikes = async () => {
    const res = await api.post(`/api/add-post-like/${post.id}`);

    if (res.status === 201) {
      setLiked(true);
      setTimeout(() => setLiked(null), 1000);
      setLikesCount(likes_count + 1);
    } else if (res.status === 200) {
      setLikesCount(likes_count - 1);
      setLiked(false);
      setTimeout(() => setLiked(null), 1000);
    } else {
      console.error("somthing wnet wrong");
    }
  };

  const handelOpenContent = (id: number) => {
    setPhotoID((preID) => (preID != id ? id : -1));
    dispatch(setBackBg(id != photoID));
  };

  const UserButtonsManager = () => {
    // check if the user's post id is equal to the user id To control the post
    if (post.user.id === +(localStorage.getItem("id") ?? 0)) {
      return (
        <div
          className="options"
          onClick={() =>
            dispatch(setBottomSheetOpen({ last_post_id: post.id, open: true }))
          }
          title="Options"
        >
          <MoreHorizIcon sx={{ width: "1.9rem", height: "1.9rem" }} />
        </div>
      );
    } else {
      // add share button instead
      return (
        <div
          className="share"
          onClick={() => handleShare(post.id)}
          title="Share"
        >
          <ShareIcon sx={{ width: "1.9rem", height: "1.9rem" }} />
        </div>
      );
    }
  };

  const MediaContent = () => {
    const posts_media: ReactNode[] = [];
    for (let i = 0; i < post.media.length; i++) {
      const current_media = post.media[i];
      if (i < 2) {
        const data = current_media.content.split("/");
        const imageName = data[data.length - 1];
        const imgAlt = imageName.split(".")[0];
        switch (current_media.content_type) {
          case "video":
            posts_media.push(
              <video
                src={`${API_URL}${current_media.content}`}
                preload="none"
                controlsList="nodownload"
                poster={current_media.poster}
                className="content-post"
                controls
                key={i}
              ></video>
            );
            break;
          case "image":
            posts_media.push(
              <img
                src={`${API_URL}${current_media.content}`}
                alt={imgAlt}
                loading="lazy"
                onClick={() => handelOpenContent(current_media.id)}
                className={`content-post ${
                  current_media.id == photoID ? "open" : ""
                }`}
                key={i}
              />
            );
            break;
        }
      } else {
        posts_media.push(
          <div
            className="post-hider"
            key={"final"}
            onClick={() =>
              dispatch(setPostContentSlider({ value: true, media: post.media }))
            }
          >
            <p className="posts-counter">+{post.media.length - 2}</p>
          </div>
        );
        break;
      }
    }

    return posts_media;
  };

  return (
    <Box className="post-container" ref={ref}>
      {!loaded ? (
        <PostSkelaton useBox={false} />
      ) : (
        <>
          <div className="post-profile">
            <Avatar
              src={
                post.user.profile_picture
                  ? `${API_URL}${post.user.profile_picture}`
                  : "/unknown.png"
              }
              alt="profile pic"
              slotProps={{
                img: {
                  loading: "lazy",
                },
              }}
              sx={{ width: "3.5rem", height: "3.5rem" }}
            />
            <div className="profile-name" style={{ textAlign: "end" }}>
              <p style={{ color: "#8f8f8f" }}>
                {new Date(post.created_at).toLocaleString()}
              </p>
              <Link
                to={{
                  pathname: `/profile/social-user`,
                  search: `?username=${post.user.username}&id=${post.user.id}`,
                }}
              >
                {post.user.username}
              </Link>
              <p style={{ color: "#8f8f8f" }}>{post.visibility}</p>
            </div>
          </div>

          {/* post description */}
          <div className="desc">
            <p>{post.description}</p>
          </div>

          {/* the post media */}
          <div className="post-content">
            <MediaContent />
          </div>

          {/* bottons for the post */}
          <div className="container post-btns-holder">
            <div
              className={`likes ${
                liked ? "liked" : liked === null ? "" : "not-liked"
              }`}
              title="Likes"
              onClick={handelLikes}
            >
              <ThumbUpOutlinedIcon sx={{ width: "1.9rem", height: "1.9rem" }} />
              <p id={`likes-${post.id}`} className="counter">
                {likes_count}
              </p>
            </div>
            <div
              className="comments"
              onClick={() =>
                dispatch(setSliderOpen({ value: true, last_post_id: post.id }))
              }
              title="Comments"
            >
              <i className="fa-regular fa-comment fa-xl"></i>
              <p id={`comments-${post.id}`} className="counter">
                {comments_count}
              </p>
            </div>
            <UserButtonsManager />
          </div>
        </>
      )}
    </Box>
  );
}
