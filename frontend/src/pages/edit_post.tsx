import { FormEvent, memo, ReactNode, useCallback, useEffect, useState } from "react";
import { Box, Button, MenuItem, Tooltip, Typography } from "@mui/material";
import FloatingLabelInput from "../components/floating_input_label";
import { MEDIA_URL, ApiUrls, Visibility } from "../utils/constants";
import { Image, LazyAvatar } from "../components/media_skelatons";
import { useNavigate, useParams } from "react-router-dom";
import PostSkelaton from "../components/post_skelaton";
import { useLoadingBar } from "react-top-loading-bar";
import styles from "../styles/edit-post.module.css";
import FilePicker from "../components/file_picker";
import { PostProps } from "../components/post";
import { Helmet } from "react-helmet";
import api from "../utils/api";

export default function EditPostPage() {
  const { id } = useParams();
  const [checked, setChecked] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [post, setPost] = useState<PostProps | null>({} as PostProps);
  const [visibility, setVisibility] = useState(
    post?.visibility || Visibility.public
  );
  const [desc, setDesc] = useState<string>(post?.description || "");
  const [files, setFiles] = useState<File[]>([]);
  const [media, setMedia] = useState(post?.media || []);
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    formData.append("postID", `${post?.id}`);
    formData.append("desc", desc);
    formData.append("visibility", visibility);

    checked.forEach((e) => formData.append("delete_media", e.toString()));
    files.forEach((file) => formData.append("files", file));

    const res = await api.putForm("/api/post/", formData);

    if (res.status === 200) {
      start();
      navigate("/");
    }
    setLoading(false);
  };

  const handleFiles = useCallback((event: FileList | null) => {
    const selectedFiles = Array.from(event || []);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          const isImage = file.type.startsWith("image");
          setMedia((prevMedia) => [
            ...prevMedia,
            {
              id: Date.now(),
              content_type: isImage ? "image" : "video",
              image: isImage ? e.target?.result as string : undefined,
              video: !isImage ? e.target?.result as string : undefined,
              added: true,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const PostMedia = memo(() => {
    const mediaData: ReactNode[] = [];
    for (let i = 0; i < media.length; i++) {
      const postMedia = media[i];
      mediaData.push(
        <input
          type="checkbox"
          name="delete_media"
          className={styles["ch-media"]}
          id={`media${postMedia?.id}`}
          defaultValue={postMedia?.id}
          key={`check-${postMedia?.id}`}
          defaultChecked={checked?.includes(postMedia?.id || -1)}
        />
      );

      if (!checked.includes(postMedia?.id || -1))
        switch (postMedia?.content_type) {
          case "video":
            mediaData.push(
              <div
                id={`${postMedia.id}`}
                className={styles["media-container"]}
                key={postMedia.id}
              >
                <video
                  src={
                    postMedia.added
                      ? postMedia.video
                      : `${MEDIA_URL}${postMedia.video}`
                  }
                  className="content-post"
                  controlsList="nodownload"
                  controls
                ></video>
                <div
                  className={`X-btn ${styles["X-btn"]}`}
                  onClick={() => setChecked((pre) => [...pre, postMedia.id])}
                >
                  <p title="Remove media">X</p>
                </div>
              </div>
            );
            break;

          case "image":
            mediaData.push(
              <div
                id={`${postMedia.id}`}
                className={styles["media-container"]}
                key={postMedia.id}
              >
                <Image
                  src={
                    postMedia.added
                      ? postMedia.image
                      : `${MEDIA_URL}${postMedia.image}`
                  }
                  alt="image"
                  className="content-post"
                />
                <div
                  className={styles["X-btn"]}
                  onClick={() => setChecked((pre) => [...pre, postMedia.id])}
                >
                  <Tooltip title="Remove media">
                    <Typography>X</Typography>
                  </Tooltip>
                </div>
              </div>
            );
            break;
        }
    }
    return mediaData;
  });
  
  const getPost = useCallback(async () => {
    try {
      const res = await api.get<PostProps>(
        ApiUrls.post_edit + id?.toString()
      );

      if (res.status === 200) {
        setPost(res.data);
        setVisibility(res.data.visibility);
        setDesc(res.data.description);
        setMedia(res.data.media);
      } else {
        setPost(null);
      }
    } catch {
      setPost(null);
    }
    complete();
  }, [id, complete]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  return (
    <>
      <Helmet>
        <title>Edit Post</title>
        <meta property="og:image" content="/favicon.ico" />
        <meta property="og:title" content="Edit Post" />
        <meta property="og:description" content="Edit Your Post" />
        <meta property="og:url" content={location.href} />
        <meta property="og:type" content="website" />
      </Helmet>
      {post === undefined ? (
        <PostSkelaton animationType="wave" />
      ) : post === null ? (
        <Typography component="h1">Post Not found!</Typography>
      ) : (
        <>
          <div className={styles["post-container"]}>
            <form
              className={styles["post-form"]}
              encType="multipart/form-data"
              onSubmit={submitForm}
            >
              <div className="post-profile">
                <LazyAvatar
                  src={`${MEDIA_URL}${post.user?.profile_picture}`}
                  alt="profile pic"
                  width='5rem'
                  height='5rem'
                  className="profile-pic"
                />
                <Typography>{post.user?.username || "user"}</Typography>
                <br />
              </div>
              <Box sx={{ width: "fit-content" }}>
                <FloatingLabelInput
                  label="Visibility"
                  inputProps={{ select: true, value: visibility }}
                  variant="standard"
                  name="visibility"
                  onChangeUpdater={(value) => setVisibility(value as Visibility)}
                >
                  <MenuItem value={Visibility.public}>Public</MenuItem>
                  <MenuItem value={Visibility.private}>Private</MenuItem>
                  <MenuItem value={Visibility.friends_only}>
                    Friends only
                  </MenuItem>
                </FloatingLabelInput>
              </Box>
              <div className="desc">
                <FloatingLabelInput
                  name="desc"
                  label="Description"
                  onChangeUpdater={(value) => setDesc(value)}
                  inputProps={{
                    multiline: true,
                    placeholder: "Description....",
                    value: desc,
                    minRows: 3,
                  }}
                />
              </div>
              <FilePicker onChangeMethod={handleFiles} />
              <div className={styles["post-content"]}>
                <PostMedia />
              </div>
              <div className={styles["btns"]}>
                <Button
                  type="submit"
                  variant="contained"
                  loading={loading}
                  loadingPosition="start"
                >
                  {loading ? "Please wait..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    start();
                    navigate("/");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
