import React from "react";
import api from "../utils/api";
import Comment from "./comment";
import "../styles/comments-slider.css";
import SendIcon from "@mui/icons-material/Send";
import CommentSkeleton from "./comment_skeleton";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import FloatingLabelInput from "./floating_input_label";
import { TransitionProps } from "@mui/material/transitions";
import { setSliderOpen, UpdatePostCommentsCount } from "../utils/store";
import { ApiUrls, CommentProps, commentSliderType } from "../utils/constants";
import { Box, Dialog, easing, IconButton, Slide, Tooltip } from "@mui/material";


interface CommantProps {
  loaded: boolean;
  comments: CommentProps[];
  postID: number;
  commentsUpdater: (comments: React.SetStateAction<CommentProps[]>) => void;
}


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

const CommentSkeletons = React.memo(() =>
  Array.from({ length: 5 }).map((_, i) => <CommentSkeleton key={i} />)
);

const Comments = React.memo(({loaded,  comments,  postID,  commentsUpdater}: CommantProps) => {
    if (loaded) {
      if (comments.length > 0)
        return comments.map((commentObj) => (
          <Comment
            comment={commentObj}
            key={commentObj.id}
            postID={postID}
            setCommentsUpdater={commentsUpdater}
          />
        ));
      else return <h1 className="text-center">No Comments</h1>;
    } else return <CommentSkeletons />;
  }
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

  const closeSlide = React.useCallback(
    () => dispatch(setSliderOpen({ last_post_id: -1, value: false })),
    [dispatch]
  );
  const handelOnCommentChange = React.useCallback(
    (value: string) => setComment(value),
    []
  );

  React.useEffect(() => {
    if (opened) {
      getComments();
    }
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
  }, [comment, comments.length, last_post_id]);


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
        <Comments
          postID={last_post_id}
          loaded={loaded}
          comments={comments}
          commentsUpdater={setComments}
        />
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
