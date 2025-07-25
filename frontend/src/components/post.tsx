import {
  setBackBg,
  setBottomSheetOpen,
  setPostContentSlider,
  setSliderOpen,
} from "../utils/store";
import {
  MEDIA_URL,
  ApiUrls,
  PostsStateType,
  User,
  Visibility,
} from "../utils/constants";
import {
  Box,
  ImageList,
  ImageListItem,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { textDir, formatNumbers, share, formatDate } from "../utils/functions";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import { memo, ReactNode, useCallback, useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import { Image, LazyAvatar } from "./media_skelatons";
import ShareIcon from "@mui/icons-material/Share";
import PostSkelaton from "./post_skelaton";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/post.css";

export interface Media {
  readonly id: number;
  content_type: string;
  image?: string;
  video?: string;
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

interface MediaContentProps {
  post: PostProps;
  photoID: number;
  onImageClick: (id: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: (action: any) => void;
}

const MediaContent = memo(
  ({ post, photoID, onImageClick, dispatch }: MediaContentProps) => {
    const posts_media: ReactNode[] = [];
    for (let i = 0; i < post.media.length; i++) {
      const current_media = post.media[i];
      if (i < 4) {
        if (current_media.video) {
          posts_media.push(
            <ImageListItem
              key={current_media.id}
              sx={{ display: "flex", placeContent: "center" }}
            >
              <video
                src={`${MEDIA_URL}${current_media.video}`}
                controlsList="nodownload"
                className="content-post"
                controls
                key={`${current_media.id}i`}
              ></video>
            </ImageListItem>
          );
        } else if (current_media.image) {
          const data = current_media.image?.split("/");
          const imageName = data ? data[data.length - 1] : "";
          const imgAlt = imageName.split(".")[0];
          posts_media.push(
            <ImageListItem
              key={current_media.id}
              sx={{ display: "flex", placeContent: "center" }}
            >
              <Image
                src={`${MEDIA_URL}${current_media.image}`}
                alt={imgAlt}
                onClick={() => onImageClick(current_media.id)}
                className={`content-post ${
                  current_media.id == photoID ? "open" : ""
                }`}
                key={`${current_media.id}i`}
              />
            </ImageListItem>
          );
        }
      } else {
        posts_media.push(
          <ImageListItem
            key={current_media.id}
            sx={{ display: "flex", placeContent: "center" }}
          >
            <div
              className="post-hider"
              key={"final"}
              onClick={() =>
                dispatch(
                  setPostContentSlider({ value: true, media: post.media })
                )
              }
            >
              <p className="posts-counter">+{post.media.length - 4}</p>
            </div>
          </ImageListItem>
        );
        break;
      }
    }

    return (
      <ImageList
        variant="masonry"
        cols={posts_media.length > 2 ? 2 : posts_media.length}
        gap={8}
        sx={{ width: "100%"}}
      >
        {posts_media}
      </ImageList>
    );
  }
);

export default function Post({ post }: { post: PostProps }) {
  const comments_count = useSelector(
    (state: PostsStateType) =>
      state.postsState.value.find((po) => po.id === post.id)?.comments_count ??
      post.comments_count
  );
  const [likes_count, setLikesCount] = useState<number>(post.likes_count);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [photoID, setPhotoID] = useState<number>(-1);
  const [loaded, setLoaded] = useState<boolean>(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0 });
  const dispatch = useDispatch();

  if (inView && !loaded) {
    setLoaded(true);
  }

  const handelLikes = useCallback(async () => {
    const res = await api.post(ApiUrls.add_post_like + post.id.toString());

    if (res.status === 201) {
      setLiked(true);
      setTimeout(() => setLiked(null), 1000);
      setLikesCount(pre => pre + 1);
    } else if (res.status === 200) {
      setLikesCount(pre => pre - 1);
      setLiked(false);
      setTimeout(() => setLiked(null), 1000);
    } else {
      console.error("somthing wnet wrong");
    }
  }, [post.id]);

  const handelOpenContent = (id: number) => {
    setPhotoID((preID) => (preID != id ? id : -1));
    dispatch(setBackBg(id !== photoID));
  };

  const UserButtonsManager = memo(() => {
    // check if the user's post id is equal to the user id To control the post
    if (post.user.id === +(localStorage.getItem("id") ?? 0)) {
      return (
        <Tooltip title="Options">
          <div
            className="options"
            onClick={() =>
              dispatch(
                setBottomSheetOpen({ last_post_id: post.id, open: true })
              )
            }
          >
            <MoreHorizIcon sx={{ width: "1.9rem", height: "1.9rem" }} />
          </div>
        </Tooltip>
      );
    } else {
      // add share button instead
      return (
        <Tooltip title="Share">
          <div className="share" onClick={() => share(post.id)}>
            <ShareIcon sx={{ width: "1.9rem", height: "1.9rem" }} />
          </div>
        </Tooltip>
      );
    }
  });

  return (
    <Box className="post-container" ref={ref}>
      {!loaded ? (
        <PostSkelaton useBox={false} />
      ) : (
        <>
          <div className="post-profile">
            <LazyAvatar
              src={`${MEDIA_URL}${post.user.profile_picture}`}
              alt="profile pic"
            />
            <div className="profile-name" style={{ textAlign: "end" }}>
              <Typography sx={{ color: "#8f8f8f" }}>
                {formatDate(post.created_at)}
              </Typography>
              <Link
                to={{
                  pathname: `/social-user-profile`,
                  search: `?username=${post.user.username}&id=${post.user.id}`,
                }}
              >
                {post.user.username}
              </Link>
              <Typography style={{ color: "#8f8f8f" }}>
                {post.visibility}
              </Typography>
            </div>
          </div>

          {/* post description */}
          <Box className="desc">
            <Typography dir={textDir(post.description)} sx={{whiteSpace: "pre-wrap"}}>{post.description}</Typography>
          </Box>

          {/* the post media */}
          <div className="post-content">
            <MediaContent
              post={post}
              photoID={photoID}
              onImageClick={handelOpenContent}
              dispatch={dispatch}
            />
          </div>

          {/* bottons for the post */}
          <div className="container post-btns-holder">
            <Tooltip title="Likes">
              <div
                className={`likes ${
                  liked ? "liked" : liked === null ? "" : "not-liked"
                }`}
                onClick={handelLikes}
              >
                <ThumbUpOutlinedIcon
                  sx={{ width: "1.9rem", height: "1.9rem" }}
                  className="likes-svg"
                />
                <Typography id={`likes-${post.id}`} className="counter">
                  {formatNumbers(likes_count)}
                </Typography>
              </div>
            </Tooltip>
            <Tooltip title="Comments">
              <div
                className="comments"
                onClick={() =>
                  dispatch(
                    setSliderOpen({ value: true, last_post_id: post.id })
                  )
                }
              >
                <SvgIcon
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9l.3-.5z" />
                </SvgIcon>
                <Typography id={`comments-${post.id}`} className="counter">
                  {formatNumbers(comments_count)}
                </Typography>
              </div>
            </Tooltip>
            <UserButtonsManager />
          </div>
        </>
      )}
    </Box>
  );
}
