import { Box, CircularProgress, Dialog, easing, IconButton, Slide, Tooltip } from "@mui/material";
import { MEDIA_URL, PostContentSliderStateType } from "../utils/constants";
import { TransitionProps } from "@mui/material/transitions";
import { useDispatch, useSelector } from "react-redux";
import { setPostContentSlider } from "../utils/store";
import CloseIcon from "@mui/icons-material/Close";
import { Image } from "./media_skelatons";
import React, { Suspense } from "react";
import { Media } from "./post";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide ref={ref} {...props} direction="left" easing={easing.easeInOut} timeout={1000} />;
});

const MediaContent = React.memo(({media}: {media: Media[]}) => {
  const data: React.ReactNode[] = [];
  for (const media_content of media) {
    switch (media_content.content_type) {
      case "image":
        data.push(
          <Image
            src={`${MEDIA_URL}${media_content.image}`}
            alt="post content"
            key={media_content.id}
            style={{maxHeight: '50%', maxWidth: '100%'}}
          />
        );
        break;
      case "video":
        data.push(
          <video
            src={`${MEDIA_URL}${media_content.video}`}
            controlsList="nodownload"
            controls
            width="50rem"
            key={media_content.id}
          ></video>
        );
        break;
    }
  }
  return data;
});

export default function RestPostMedia() {
  const media = useSelector(
    (state: PostContentSliderStateType) => state.post_content_slider.media
  );
  const isOpen = useSelector(
    (state: PostContentSliderStateType) => state.post_content_slider.value
  );
  const dispatch = useDispatch();


  const closeSlider = React.useCallback(() => dispatch(setPostContentSlider({ value: false, media: [] })), [dispatch]);

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={closeSlider}
      TransitionComponent={Transition}
      keepMounted
    >
      <Tooltip title="Close">
        <IconButton type="button" onClick={closeSlider} sx={{ width: 'fit-content' }}>
          <CloseIcon />
        </IconButton>
      </Tooltip>

      <Box sx={{ width: '100%', height: '100%', display: 'flex', placeItems: 'center', flexDirection: 'column' }}>
        <Suspense fallback={<CircularProgress />}>
          <MediaContent media={media} />
        </Suspense>
      </Box>
    </Dialog>
  );
}
