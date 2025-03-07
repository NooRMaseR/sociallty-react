import { ApiUrls, CommentProps, MEDIA_URL, PostsStateType } from "../utils/constants";
import { SetStateAction, useCallback, useState } from "react";
import { Card, Tooltip, Typography } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { UpdatePostCommentsCount } from "../utils/store";
import { useDispatch, useSelector } from "react-redux";
import { formatNumbers } from "../utils/functions";
import { LazyAvatar } from "./media_skelatons";
import { Link } from "react-router-dom";
import api from "../utils/api";

interface ICommentProps {
  postID: number;
  comment: CommentProps;
  setCommentsUpdater: (value: SetStateAction<CommentProps[]>) => void;
}

export default function Comment({
  postID,
  comment,
  setCommentsUpdater,
}: ICommentProps) {
  const [optionsOpened, setOptionsOpened] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(comment.comment_likes);
  const comments_Count = useSelector(
    (state: PostsStateType) =>
      state.postsState.value.find((po) => po.id === postID)?.comments_count
  );
  const dispatch = useDispatch();

  const handelOpenOptions = useCallback(() => {
    setOptionsOpened((prev) => !prev);
    setTimeout(() => setOptionsOpened(false), 5000);
  }, []);

  const deleteComment = useCallback(async () => {
    try {
      const res = await api.delete(
        ApiUrls.post_comment + comment.id.toString()
      );
      if (res.status === 200) {
        setCommentsUpdater((prevComments) =>
          prevComments.filter((comm) => comm.id !== comment.id)
        );
        dispatch(
          UpdatePostCommentsCount({
            postID,
            count: (comments_Count ?? comment.comment_likes) - 1,
          })
        );
      }
    } catch {
      console.error("somthing went wrong");
    } finally {
      setOptionsOpened(false);
    }
  }, [
    comment.comment_likes,
    comment.id,
    comments_Count,
    dispatch,
    postID,
    setCommentsUpdater,
  ]);

  const addCommentLike = useCallback(async () => {
    try {
      const res = await api.post(
        ApiUrls.add_comment_like + comment.id.toString()
      );
      if (res.data.created) {
        setLikes((prevLike) => prevLike + 1);
      } else {
        setLikes((prevLike) => prevLike - 1);
      }
    } catch {
      console.error("somthing went wrong 2");
    } finally {
      setOptionsOpened(false);
    }
  }, [comment.id]);

  return (
    <>
      <Card className="user-comment">
        <div
          className={`comment-container-options ${
            optionsOpened ? "options-opened" : ""
          }`}
        >
          <div className="option" onClick={addCommentLike}>
            <Typography>Like</Typography>
            <Typography>{formatNumbers(likes ?? 0)}</Typography>
          </div>
          {/* check if the comment belong to the user or the post belong to the user */}
          {comment.user.id === +(localStorage.getItem("id") ?? 0) && (
            <Typography className="option" onClick={deleteComment}>
              Delete
            </Typography>
          )}
        </div>
        <div className="comment-options-container">
          <Tooltip title="Options">
            <MoreHorizIcon
              onClick={handelOpenOptions}
              sx={{ color: "var(--text-color)", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
        <div className="d-flex gap-2">
          <LazyAvatar src={`${MEDIA_URL}${comment.user.profile_picture}`} />
          <Link
            className="comment-user"
            to={{
              pathname: `/social-user-profile`,
              search: `?username=${comment.user.username}&id=${comment.user.id}`,
            }}
          >
            {comment.user.username}
          </Link>
        </div>
        <Typography className="comment-text">{comment.content}</Typography>
        <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
          <Typography className="comment-time">
            {new Date(comment.created_at).toLocaleString()}
          </Typography>
        </div>
      </Card>
    </>
  );
}
