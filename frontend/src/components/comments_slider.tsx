import React from "react";
import api from "../utils/api";
import Comment from "./comment";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import FloatingLabelInput from "./floating_input_label";
import { TransitionProps } from "@mui/material/transitions";
import { setSliderOpen, UpdatePostCommentsCount } from "../utils/store";
import { ApiUrls, CommentProps, commentSliderType } from "../utils/constants";
import { Box, Dialog, easing, IconButton, Slide, Tooltip } from "@mui/material";
import CommentSkeleton from "./comment_skeleton";

const Transition = React.forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>
  ) => (
    <Slide
      direction="up"
      ref={ref}
      {...props}
      timeout={1000}
      easing={{ enter: easing.easeInOut, exit: easing.easeInOut }}
    />
  )
);

export default function CommentsSlider() {
  const dispatch = useDispatch();
  const [comment, setComment] = React.useState<string>("");
  const [comments, setComments] = React.useState<CommentProps[]>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const opened = useSelector(
    (state: commentSliderType) => state.comment_slider_state.value
  );
  const last_post_id = useSelector(
    (state: commentSliderType) => state.comment_slider_state.last_post_id
  );

  const getComments = React.useCallback(async () => {
    setLoaded(false);
    setComment("");
    try {
      const res = await api.get(ApiUrls.post_comment + last_post_id.toString());

      if (res.status === 200) {
        setComments(res.data.comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      setComments([]);
      console.error(error);
    } finally {
      setLoaded(true);
    }
  }, [last_post_id]);

  React.useEffect(() => {
    if (opened) getComments();
  }, [opened, getComments]);

  const sendComment = React.useCallback(async () => {
    const res = await api.post<CommentProps>(
      ApiUrls.post_comment + last_post_id.toString(),
      { comment }
    );

    if (res.status === 201) {
      setComment("");
      setComments((prevComments) => [...prevComments, res.data]);
      dispatch(
        UpdatePostCommentsCount({
          postID: last_post_id,
          count: comments.length + 1,
        })
      );
    }
  }, [comment, comments.length, dispatch, last_post_id]);

  const closeSlide = React.useCallback(
    () => dispatch(setSliderOpen({ last_post_id: -1, value: false })),
    [dispatch]
  );
  const handelOnCommentChange = React.useCallback(
    (value: string) => setComment(value),
    []
  );
  const Comments = React.memo(() => {
    if (loaded) {
      if (comments.length > 0) return comments.map((commentObj) => (
          <Comment
            comment={commentObj}
            key={commentObj.id}
            postID={last_post_id}
            setCommentsUpdater={setComments}
        />
      ))
      else return <h1>No Comments</h1>
    }
    else return <CommentSkeletons />
  });

  const CommentSkeletons = React.memo(() => {
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      nodes.push(<CommentSkeleton key={i} />);
    };
    return nodes;
  })

  return (
    <Dialog
      fullScreen
      open={opened}
      onClose={closeSlide}
      TransitionComponent={Transition}
      keepMounted
    >
      <Box sx={{ placeContent: "end", width: "100%" }}>
        <Tooltip title="send">
          <IconButton type="button" onClick={closeSlide}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <div id="comments">
        <Comments />
      </div>
      <div id="div-send">
        <FloatingLabelInput
          variant="outlined"
          label="Add Comment"
          type="text"
          updater={handelOnCommentChange}
          inputProps={{ value: comment, multiline: true, maxRows: 6 }}
          sx={{ maxWidth: "100%" }}
        />
        <IconButton type="button" onClick={sendComment} title="Send Comment">
          <SendIcon />
        </IconButton>
      </div>
    </Dialog>
  );
}
