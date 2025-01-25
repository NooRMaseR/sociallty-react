import { ApiUrls, PostFormProps, Visibility } from "../utils/constants";
import FloatingLabelInput from "../components/floating_input_label";
import FilePicker from "../components/file_picker";
import { Button, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import { useState } from "react";
import api from "../utils/api";

export default function MakePostPage() {
  const { register, handleSubmit, setValue } = useForm<PostFormProps>();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const formSubmit = async (data: PostFormProps) => {
    setLoading(true);
    const form_data = new FormData();
    form_data.append("desc", data.desc);
    form_data.append("visibility", data.visibility);
    data?.files?.forEach((file) => form_data.append("files", file));

    try {
      const res = await api.post(ApiUrls.post, form_data);

      if (res.status === 201) {
        navigate("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div id="container">
      <Helmet>
        <title>Create New Post</title>
        <meta name="description" content="Create a New Post and get some reactions and reviews" />
      </Helmet>
      <form
        onSubmit={handleSubmit(formSubmit)}
        encType="multipart/form-data"
        id="post-form"
      >
        <FilePicker
          onChangeMethod={(e) =>
            setValue("files", Array.from(e.target.files || []))
          }
        />
        <FloatingLabelInput
          label="Description"
          inputProps={{ multiline: true, ...register("desc") }}
        />
        <FloatingLabelInput label="Visibility" variant="filled" inputProps={{defaultValue: Visibility.public, select: true , ...register("visibility")}}>
          <MenuItem value={Visibility.public}>Public</MenuItem>
          <MenuItem value={Visibility.private}>Private</MenuItem>
          <MenuItem value={Visibility.friends_only}>Friends only</MenuItem>
        </FloatingLabelInput>
        <Button variant="contained" type="submit" loading={loading} loadingPosition="start">
          Post
        </Button>
      </form>
    </div>
  );
}
