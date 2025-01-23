import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL, Visibility } from "../utils/constants";
import styles from "../styles/edit-post.module.css";
import FilePicker from "../components/file_picker";
import { PostProps } from "../components/post";
import api from "../utils/api";

export default function EditPostPage() {
  document.title = "Edit Post";
  const { id } = useParams();
  const [checked, setChecked] = useState<number[]>([]);
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
  };

  const handleFiles = (event: FileList) => {
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
  };

  const PostMedia = () => {
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
  };

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await api.get<PostProps>(`post-edit/${id}/`);

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
    };
    getPost();
  }, [id]);

  return post === undefined ? (
    <h1 className="text-white">Loading...</h1>
  ) : post === null ? (
    <h1 className="text-white">Post Not found!</h1>
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
            <a href="{% url 'profile' username=post.user.username %}{{post.user.id}}">
              {post.user?.username || "ali"}
            </a>
            <select
              name="visibility"
              id="visibility"
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              value={visibility}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends only">Friends only</option>
            </select>
          </div>
          <div className="desc">
            <textarea
              name="desc"
              placeholder="Description...."
              className={styles.textarea}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
            ></textarea>
          </div>
          {/* <c-files_picker :adding="True" add_to=".post-content"></c-files_picker> */}
          <FilePicker
            onChangeMethod={(e) =>
              e.target.files && handleFiles(e.target.files)
            }
          />
          <div className={styles["post-content"]}>
            <PostMedia />
          </div>
          <div className={styles["btns"]}>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
