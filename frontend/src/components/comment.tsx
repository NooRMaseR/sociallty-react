import { ApiUrls, CommentProps, MEDIA_URL, PostsStateType } from "../utils/constants";
import { Box, Card, ClickAwayListener, Tooltip, Typography } from "@mui/material";
import { setSliderOpen, UpdatePostCommentsCount } from "../utils/store";
import { textDir, formatNumbers, formatDate } from "../utils/functions";
import { SetStateAction, useCallback, useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useDispatch, useSelector } from "react-redux";
import { LazyAvatar } from "./media_skelatons";
import { Link } from "react-router-dom";
import api from "../utils/api";

interface ICommentProps {
  postID: number;
  comment: CommentProps;
  setCommentsUpdater: (value: SetStateAction<CommentProps[]>) => void;
}

export default function Comment({postID,  comment,  setCommentsUpdater}: ICommentProps) {
  const [optionsOpened, setOptionsOpened] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(comment.comment_likes || 0);
  const comments_Count = useSelector(
    (state: PostsStateType) =>
      state.postsState.value.find((po) => po.id === postID)?.comments_count
  );
  const dispatch = useDispatch();

  const openOptions = useCallback(() => {
    setOptionsOpened(true);
  }, []);
  
  const closeOptions = useCallback(() => {
    setOptionsOpened(false);
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
      <Card className="user-comment" sx={{backgroundColor: "#161616"}}>
        <div className={`comment-container-options ${optionsOpened ? "options-opened" : ""}`}>
          <div className="option" onClick={addCommentLike} onTouchEnd={addCommentLike} role="button">
            <Typography onClick={addCommentLike}>Like</Typography>
            <Typography>{formatNumbers(likes ?? 0)}</Typography>
          </div>
          {/* check if the comment belong to the user or the post belong to the user */}
          {comment.user.id === +(localStorage.getItem("id") ?? 0) ? (
            <Typography className="option" onClick={deleteComment} onTouchEnd={deleteComment}>
              Delete
            </Typography>
          ): null}
        </div>
        <ClickAwayListener onClickAway={closeOptions}>
          <Tooltip title="Options">
            <MoreHorizIcon
              className="comment-options"
              onClick={openOptions}
            />
          </Tooltip>
        </ClickAwayListener>
        <Box sx={{display: 'flex', alignItems: "center", gap: ".5rem"}}>
          <LazyAvatar src={`${MEDIA_URL}${comment.user.profile_picture}`} />
          <Link
            className="comment-user"
            to={{
              pathname: `/social-user-profile`,
              search: `?username=${comment.user.username}&id=${comment.user.id}`,
            }}
            onClick={() => dispatch(setSliderOpen({last_post_id: -1, value: false}))}
          >
            {comment.user.username}
          </Link>
        </Box>
        <Typography className="comment-text" dir={textDir(comment.content)} sx={{margin: ".5rem"}}>{comment.content}</Typography>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
          <Typography className="comment-time">
            {formatDate(comment.created_at)}
          </Typography>
        </Box>
      </Card>
    </>
  );
}
