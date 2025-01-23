import { useDispatch, useSelector } from "react-redux";
import { setPostContentSlider } from "../utils/store";
import { ReactNode, useEffect } from "react";
import { API_URL } from "../utils/constants";
import { Media } from "./post";

export default function RestPostMedia() {
  const media = useSelector(
    (state: { post_content_slider: { media: Media[] } }) =>
      state.post_content_slider.media
  );
  const isOpen = useSelector(
    (state: { post_content_slider: { value: boolean } }) =>
      state.post_content_slider.value
  );
  const dispatch = useDispatch();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const MediaContent = () => {
    const data: ReactNode[] = [];
    for (const media_content of media) {
      switch (media_content.content_type) {
        case "image":
          data.push(
            <img
              src={`${API_URL}${media_content.content}`}
              alt="post content"
              className="media-content"
              width="50rem"
              key={media_content.id}
            />
          );
          break;
        case "video":
          data.push(
            <video
              src={`${API_URL}${media_content.content}`}
              preload="none"
              poster={`${API_URL}${media_content.poster}`}
              controlsList="nodownload"
              className="media-content"
              controls
              width="50rem"
              key={media_content.id}
            ></video>
          );
          break;
      }
    }
    return data;
  };

  return (
    <div
      id="post-content-slider"
      className={isOpen ? "post-content-slider-opened" : ""}
    >
      <div
        id="close-slide-container"
        onClick={() =>
          dispatch(setPostContentSlider({ value: false, media: [] }))
        }
      >
        <p
          id="close-content-slider"
          style={{ color: "var(--text-color)", cursor: "pointer" }}
        >
          X
        </p>
      </div>

      <div id="content">
        <MediaContent />
      </div>
    </div>
  );
}
