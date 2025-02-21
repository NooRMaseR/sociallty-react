import { FormEvent, memo, ReactNode, useCallback, useEffect, useState } from "react";
import FloatingLabelInput from "../components/floating_input_label";
import { API_URL, ApiUrls, Visibility } from "../utils/constants";
import { useNavigate, useParams } from "react-router-dom";
import PostSkelaton from "../components/post_skelaton";
import { Box, Button, MenuItem } from "@mui/material";
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
      navigate("/");
    }
    setLoading(false);
  };

  const handleFiles = useCallback((event: FileList) => {
    const selectedFiles = Array.from(event || []);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setMedia((prevMedia) => [
            ...prevMedia,
            {
              id: Date.now(),
              content_type: file.type.startsWith("image") ? "image" : "video",
              content: e.target?.result as string,
              poster: "",
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
                      ? postMedia.content
                      : `${API_URL}${postMedia.content}`
                  }
                  preload="none"
                  className="content-post"
                  controlsList="nodownload"
                  poster={postMedia.poster}
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
                <img
                  src={
                    postMedia.added
                      ? postMedia.content
                      : `${API_URL}${postMedia.content}`
                  }
                  alt="image"
                  className="content-post"
                />
                <div
                  className={styles["X-btn"]}
                  onClick={() => setChecked((pre) => [...pre, postMedia.id])}
                >
                  <p title="Remove media">X</p>
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
  }, [id]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  return (
    <>
      <Helmet>
        <title>Edit Post</title>
      </Helmet>
      {post === undefined ? (
        <PostSkelaton animationType="wave" />
      ) : post === null ? (
        <h1>Post Not found!</h1>
      ) : (
        <>
          <div className={styles["post-container"]}>
            <form
              className={styles["post-form"]}
              encType="multipart/form-data"
              onSubmit={submitForm}
            >
              <div className="post-profile">
                <img
                  src={`${API_URL}${post.user?.profile_picture}`}
                  alt="profile pic"
                  loading="lazy"
                  width="50rem"
                  className="profile-pic"
                />
                <p>{post.user?.username || "user"}</p>
                <br />
              </div>
              <Box sx={{ width: "fit-content" }}>
                <FloatingLabelInput
                  label="Visibility"
                  inputProps={{ select: true, value: visibility }}
                  variant="standard"
                  name="visibility"
                  updater={(value) => setVisibility(value as Visibility)}
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
                  updater={(value) => setDesc(value)}
                  inputProps={{
                    multiline: true,
                    placeholder: "Description....",
                    value: desc,
                    minRows: 3,
                  }}
                />
              </div>
              <FilePicker
                onChangeMethod={(e) =>
                  e.target.files && handleFiles(e.target.files)
                }
              />
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
                  onClick={() => navigate("/")}
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
